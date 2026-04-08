import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MeshLambertMaterial,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CrystalClass, SymmetryElement, Vec3, WireframePreset } from "./data";

const elementColors = {
  rotation: new Color("#f7a55f"),
  mirror: new Color("#7fd6ff"),
  inversion: new Color("#fff28d"),
  rotoinversion: new Color("#fb7ea8"),
} as const;

const vector = ([vx, vy, vz]: Vec3) => new Vector3(vx, vy, vz).normalize();

const buildLineGeometry = (segments: number[][]) => {
  const positions = segments.flat();
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
};

const wireframeMaterial = new LineBasicMaterial({
  color: "#f6f3ef",
  transparent: true,
  opacity: 0.92,
});

const baseSegments = (points: number[][], edges: Array<[number, number]>) =>
  edges.map(([start, end]) => [...points[start], ...points[end]]);

const edgesFromFaces = (faces: number[][]): Array<[number, number]> => {
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];
  faces.forEach((face) => {
    for (let index = 0; index < face.length; index += 1) {
      const start = face[index];
      const end = face[(index + 1) % face.length];
      const edge = start < end ? `${start}:${end}` : `${end}:${start}`;
      if (!seen.has(edge)) {
        seen.add(edge);
        edges.push(start < end ? [start, end] : [end, start]);
      }
    }
  });
  return edges;
};

interface CrystalShapeData {
  points: number[][];
  edges: Array<[number, number]>;
  faces: number[][];
}

const triangulate = (faces: number[][]) =>
  faces.flatMap((face) => {
    const triangles: number[] = [];
    for (let index = 1; index < face.length - 1; index += 1) {
      triangles.push(face[0], face[index], face[index + 1]);
    }
    return triangles;
  });

const prismPoints = (sides: number, radius: number, halfHeight: number) => {
  const top: number[][] = [];
  const bottom: number[][] = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = (index / sides) * Math.PI * 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    top.push([px, py, halfHeight]);
    bottom.push([px, py, -halfHeight]);
  }
  return [...top, ...bottom];
};

const prismEdges = (sides: number): Array<[number, number]> => {
  const edges: Array<[number, number]> = [];
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    edges.push([index, next]);
    edges.push([index + sides, next + sides]);
    edges.push([index, index + sides]);
  }
  return edges;
};

const prismFaces = (sides: number) => {
  const top = Array.from({ length: sides }, (_, index) => index);
  const bottom = Array.from({ length: sides }, (_, index) => index + sides).reverse();
  const sidesFaces = Array.from({ length: sides }, (_, index) => {
    const next = (index + 1) % sides;
    return [index, next, next + sides, index + sides];
  });
  return [top, bottom, ...sidesFaces];
};

const polygonRing = (sides: number, radius: number, z: number, rotation = 0) =>
  Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z];
  });

const alternatingRing = (
  sides: number,
  outerRadius: number,
  innerRadius: number,
  z: number,
  rotation = 0,
) =>
  Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * Math.PI * 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z];
  });

const createPyramidData = (ring: number[][], apex: number[]) => {
  const apexIndex = ring.length;
  const points = [...ring, apex];
  const faces = [Array.from({ length: ring.length }, (_, index) => index)];
  for (let index = 0; index < ring.length; index += 1) {
    const next = (index + 1) % ring.length;
    faces.push([index, next, apexIndex]);
  }
  return { points, faces, edges: edgesFromFaces(faces) };
};

const createBipyramidData = (ring: number[][], top: number[], bottom: number[]) => {
  const topIndex = ring.length;
  const bottomIndex = ring.length + 1;
  const points = [...ring, top, bottom];
  const faces = bipyramidFaces(ring.length, topIndex, bottomIndex);
  return { points, faces, edges: edgesFromFaces(faces) };
};

const createDisphenoidData = (xRadius: number, yRadius: number, height: number) => {
  const points = [
    [xRadius, 0, height],
    [-xRadius, 0, height],
    [0, yRadius, -height],
    [0, -yRadius, -height],
  ];
  const faces = [
    [0, 2, 1],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ];
  return { points, faces, edges: edgesFromFaces(faces) };
};

const createTrapezohedronData = (
  sides: number,
  upperRadius: number,
  lowerRadius: number,
  upperZ: number,
  lowerZ: number,
  topZ: number,
  bottomZ: number,
) => {
  const upperRing = polygonRing(sides, upperRadius, upperZ);
  const lowerRing = polygonRing(sides, lowerRadius, lowerZ, Math.PI / sides);
  const topIndex = 0;
  const bottomIndex = 1;
  const upperStart = 2;
  const lowerStart = upperStart + sides;
  const points = [[0, 0, topZ], [0, 0, bottomZ], ...upperRing, ...lowerRing];
  const faces: number[][] = [];
  for (let index = 0; index < sides; index += 1) {
    const next = (index + 1) % sides;
    const prev = (index - 1 + sides) % sides;
    const upper = upperStart + index;
    const upperNext = upperStart + next;
    const lower = lowerStart + index;
    const lowerPrev = lowerStart + prev;
    faces.push([topIndex, upper, lower, upperNext]);
    faces.push([bottomIndex, lower, upper, lowerPrev]);
  }
  return { points, faces, edges: edgesFromFaces(faces) };
};

const bipyramidFaces = (ringSize: number, topIndex: number, bottomIndex: number) => [
  Array.from({ length: ringSize }, (_, index) => index),
  ...Array.from({ length: ringSize }, (_, index) => {
    const next = (index + 1) % ringSize;
    return [index, next, topIndex];
  }),
  ...Array.from({ length: ringSize }, (_, index) => {
    const next = (index + 1) % ringSize;
    return [next, index, bottomIndex];
  }),
];

const createShapeData = (preset: WireframePreset): CrystalShapeData => {
  switch (preset) {
    case "triclinic-cell": {
      const points = [
        [-1.2, -0.8, -1.0],
        [1.0, -0.5, -1.1],
        [1.3, 0.9, -0.8],
        [-0.9, 0.6, -0.7],
        [-0.7, -0.2, 1.0],
        [1.5, 0.1, 0.9],
        [1.8, 1.5, 1.2],
        [-0.4, 1.2, 1.3],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
        ],
      };
    }
    case "monoclinic-prism": {
      const points = [
        [-1.3, -0.8, -1.0],
        [1.2, -0.8, -1.0],
        [1.6, 0.8, -1.0],
        [-0.9, 0.8, -1.0],
        [-0.8, -0.8, 1.0],
        [1.7, -0.8, 1.0],
        [2.1, 0.8, 1.0],
        [-0.4, 0.8, 1.0],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
        ],
      };
    }
    case "orthorhombic-prism": {
      const points = [
        [-1.3, -0.8, -1.0],
        [1.3, -0.8, -1.0],
        [1.3, 0.8, -1.0],
        [-1.3, 0.8, -1.0],
        [-1.3, -0.8, 1.0],
        [1.3, -0.8, 1.0],
        [1.3, 0.8, 1.0],
        [-1.3, 0.8, 1.0],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
        ],
      };
    }
    case "orthorhombic-dipyramid": {
      const points = [
        [-1.3, -0.8, 0],
        [1.3, -0.8, 0],
        [1.3, 0.8, 0],
        [-1.3, 0.8, 0],
        [0, 0, 1.5],
        [0, 0, -1.5],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ];
      return { points, edges, faces: bipyramidFaces(4, 4, 5) };
    }
    case "orthorhombic-disphenoid":
      return createDisphenoidData(1.45, 0.95, 1.05);
    case "orthorhombic-pyramid":
      return createPyramidData(
        [
          [-1.3, -0.85, -1.05],
          [1.3, -0.85, -1.05],
          [1.3, 0.85, -1.05],
          [-1.3, 0.85, -1.05],
        ],
        [0, 0, 1.45],
      );
    case "tetragonal-prism": {
      const points = [
        [-1, -1, -1.3],
        [1, -1, -1.3],
        [1, 1, -1.3],
        [-1, 1, -1.3],
        [-1, -1, 1.3],
        [1, -1, 1.3],
        [1, 1, 1.3],
        [-1, 1, 1.3],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
        ],
      };
    }
    case "tetragonal-dipyramid": {
      const points = [
        [-1.1, -1.1, 0],
        [1.1, -1.1, 0],
        [1.1, 1.1, 0],
        [-1.1, 1.1, 0],
        [0, 0, 1.7],
        [0, 0, -1.7],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ];
      return { points, edges, faces: bipyramidFaces(4, 4, 5) };
    }
    case "tetragonal-pyramid":
      return createPyramidData(polygonRing(4, 1.25, -1.15, Math.PI / 4), [0, 0, 1.45]);
    case "tetragonal-disphenoid":
      return createDisphenoidData(1.15, 1.15, 1.15);
    case "tetragonal-trapezohedron":
      return createTrapezohedronData(4, 1.2, 0.85, 0.45, -0.45, 1.75, -1.75);
    case "ditetragonal-pyramid":
      return createPyramidData(alternatingRing(8, 1.35, 0.88, -1.15, Math.PI / 8), [0, 0, 1.45]);
    case "ditetragonal-dipyramid":
      return createBipyramidData(alternatingRing(8, 1.3, 0.9, 0, Math.PI / 8), [0, 0, 1.75], [0, 0, -1.75]);
    case "trigonal-prism": {
      const points = [
        [1.2, 0, 1.2],
        [-0.6, 1.04, 1.2],
        [-0.6, -1.04, 1.2],
        [1.2, 0, -1.2],
        [-0.6, 1.04, -1.2],
        [-0.6, -1.04, -1.2],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
        [0, 3],
        [1, 4],
        [2, 5],
      ];
      return { points, edges, faces: prismFaces(3) };
    }
    case "trigonal-rhombohedron": {
      const points = [
        [1.2, 0, 0.65],
        [-0.6, 1.04, 0.65],
        [-0.6, -1.04, 0.65],
        [0.6, 1.04, -0.65],
        [-1.2, 0, -0.65],
        [0.6, -1.04, -0.65],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
        [0, 3],
        [1, 4],
        [2, 5],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2],
          [3, 4, 5],
          [0, 1, 4, 3],
          [1, 2, 5, 4],
          [2, 0, 3, 5],
        ],
      };
    }
    case "trigonal-pyramid":
      return createPyramidData(polygonRing(3, 1.3, -1.1, Math.PI / 2), [0, 0, 1.45]);
    case "hexagonal-prism": {
      const points = prismPoints(6, 1.1, 1.25);
      return { points, edges: prismEdges(6), faces: prismFaces(6) };
    }
    case "hexagonal-dipyramid": {
      const ring: number[][] = [];
      for (let index = 0; index < 6; index += 1) {
        const angle = (index / 6) * Math.PI * 2;
        ring.push([Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, 0]);
      }
      const points = [...ring, [0, 0, 1.7], [0, 0, -1.7]];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
        [0, 7],
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
      ];
      return { points, edges, faces: bipyramidFaces(6, 6, 7) };
    }
    case "trigonal-trapezohedron":
      return createTrapezohedronData(3, 1.15, 0.8, 0.4, -0.4, 1.6, -1.6);
    case "ditrigonal-pyramid":
      return createPyramidData(alternatingRing(6, 1.35, 0.85, -1.15, Math.PI / 6), [0, 0, 1.5]);
    case "ditrigonal-dipyramid":
      return createBipyramidData(alternatingRing(6, 1.25, 0.82, 0, Math.PI / 6), [0, 0, 1.72], [0, 0, -1.72]);
    case "hexagonal-pyramid":
      return createPyramidData(polygonRing(6, 1.2, -1.15, Math.PI / 6), [0, 0, 1.45]);
    case "hexagonal-trapezohedron":
      return createTrapezohedronData(6, 1.2, 0.92, 0.42, -0.42, 1.8, -1.8);
    case "dihexagonal-pyramid":
      return createPyramidData(alternatingRing(12, 1.28, 0.98, -1.18, Math.PI / 12), [0, 0, 1.5]);
    case "dihexagonal-dipyramid":
      return createBipyramidData(alternatingRing(12, 1.24, 0.96, 0, Math.PI / 12), [0, 0, 1.82], [0, 0, -1.82]);
    case "cube": {
      const points = [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
        ],
      };
    }
    case "tetrahedron": {
      const points = [
        [1.2, 1.2, 1.2],
        [-1.2, -1.2, 1.2],
        [-1.2, 1.2, -1.2],
        [1.2, -1.2, -1.2],
      ];
      const edges: Array<[number, number]> = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 1, 2],
          [0, 1, 3],
          [0, 2, 3],
          [1, 2, 3],
        ],
      };
    }
    case "octahedron": {
      const points = [
        [1.45, 0, 0],
        [-1.45, 0, 0],
        [0, 1.45, 0],
        [0, -1.45, 0],
        [0, 0, 1.45],
        [0, 0, -1.45],
      ];
      const edges: Array<[number, number]> = [
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 4],
        [2, 5],
        [3, 4],
        [3, 5],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 2, 4],
          [2, 1, 4],
          [1, 3, 4],
          [3, 0, 4],
          [2, 0, 5],
          [1, 2, 5],
          [3, 1, 5],
          [0, 3, 5],
        ],
      };
    }
    case "cuboctahedron": {
      const points = [
        [1, 1, 0],
        [1, -1, 0],
        [-1, 1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [1, 0, -1],
        [-1, 0, 1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, 1, -1],
        [0, -1, 1],
        [0, -1, -1],
      ];
      const edges: Array<[number, number]> = [
        [0, 4],
        [0, 8],
        [0, 5],
        [0, 9],
        [1, 4],
        [1, 10],
        [1, 5],
        [1, 11],
        [2, 6],
        [2, 8],
        [2, 7],
        [2, 9],
        [3, 6],
        [3, 10],
        [3, 7],
        [3, 11],
        [4, 8],
        [4, 10],
        [5, 9],
        [5, 11],
        [6, 8],
        [6, 10],
        [7, 9],
        [7, 11],
      ];
      return {
        points,
        edges,
        faces: [
          [0, 4, 8],
          [2, 8, 6],
          [1, 10, 4],
          [3, 6, 10],
          [0, 9, 5],
          [2, 7, 9],
          [1, 5, 11],
          [3, 11, 7],
          [0, 4, 1, 5],
          [2, 7, 3, 6],
          [8, 0, 9, 2],
          [10, 3, 11, 1],
          [8, 6, 10, 4],
          [9, 5, 11, 7],
        ],
      };
    }
  }
};

const createWireframeSegments = (preset: WireframePreset) => {
  const shape = createShapeData(preset);
  return baseSegments(shape.points, shape.edges);
};

const createSkinMesh = (preset: WireframePreset, opacity: number) => {
  const shape = createShapeData(preset);
  const positions = shape.points.flat();
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(triangulate(shape.faces));
  geometry.computeVertexNormals();
  const material = new MeshLambertMaterial({
    color: "#b0d5f3",
    transparent: true,
    opacity,
    depthWrite: opacity > 0.98,
  });
  return new Mesh(geometry, material);
};

const createAxisElement = (element: SymmetryElement) => {
  const direction = vector(element.direction ?? [0, 0, 1]);
  const length = 4.2;
  const start = direction.clone().multiplyScalar(-length / 2);
  const end = direction.clone().multiplyScalar(length / 2);
  const material =
    element.type === "rotoinversion"
      ? new LineDashedMaterial({
          color: elementColors.rotoinversion,
          dashSize: 0.22,
          gapSize: 0.12,
          transparent: true,
          opacity: 0.95,
        })
      : new LineBasicMaterial({
          color: elementColors.rotation,
          transparent: true,
          opacity: 0.95,
        });

  const geometry = buildLineGeometry([[start.x, start.y, start.z, end.x, end.y, end.z]]);
  const line = new Line(geometry, material);
  if (line instanceof Line && "computeLineDistances" in line) {
    line.computeLineDistances();
  }
  return line;
};

const createMirrorElement = (element: SymmetryElement) => {
  const normal = vector(element.normal ?? [0, 0, 1]);
  const geometry = new PlaneGeometry(3.5, 3.5);
  const material = new MeshBasicMaterial({
    color: elementColors.mirror,
    transparent: true,
    opacity: 0.18,
    side: 2,
    depthWrite: false,
  });
  const plane = new Mesh(geometry, material);
  plane.lookAt(normal);
  return plane;
};

const createInversionElement = () =>
  new Mesh(
    new SphereGeometry(0.12, 24, 24),
    new MeshBasicMaterial({
      color: elementColors.inversion,
      transparent: true,
      opacity: 0.96,
    }),
  );

export class CrystalViewer {
  private renderer: WebGLRenderer;

  private scene: Scene;

  private camera: PerspectiveCamera;

  private controls: OrbitControls;

  private root: Group;

  private resizeObserver: ResizeObserver;

  constructor(private container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor("#0a1015", 0);
    this.renderer.domElement.className = "viewer-canvas";

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(4.8, 4.4, 5.4);
    this.scene.add(new AmbientLight("#ffffff", 1.35));
    const keyLight = new DirectionalLight("#d7efff", 1.8);
    keyLight.position.set(4, 5, 6);
    this.scene.add(keyLight);
    const fillLight = new DirectionalLight("#ffd8a8", 0.95);
    fillLight.position.set(-5, -2, 3);
    this.scene.add(fillLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 12;

    this.root = new Group();
    this.scene.add(this.root);

    this.container.appendChild(this.renderer.domElement);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
    this.animate();
  }

  setCrystal(crystalClass: CrystalClass, visibleIds: Set<string>, skinOpacity = 0) {
    this.root.clear();

    if (skinOpacity > 0) {
      const skin = createSkinMesh(crystalClass.wireframePreset, skinOpacity);
      this.root.add(skin);
    }

    const wireframe = new LineSegments(
      buildLineGeometry(createWireframeSegments(crystalClass.wireframePreset)),
      wireframeMaterial,
    );
    this.root.add(wireframe);

    crystalClass.elements
      .filter((element) => visibleIds.has(element.id))
      .forEach((element) => {
        const object =
          element.type === "mirror"
            ? createMirrorElement(element)
            : element.type === "inversion"
              ? createInversionElement()
              : createAxisElement(element);
        object.userData = { elementId: element.id };
        this.root.add(object);
      });
  }

  dispose() {
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }

  private resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
}
