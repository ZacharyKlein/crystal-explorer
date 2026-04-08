import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
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

const createWireframeSegments = (preset: WireframePreset) => {
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
      return baseSegments(points, [
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
      ]);
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
      return baseSegments(points, [
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
      ]);
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
      return baseSegments(points, [
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
      ]);
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
      return baseSegments(points, [
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
      ]);
    }
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
      return baseSegments(points, [
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
      ]);
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
      return baseSegments(points, [
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
      ]);
    }
    case "trigonal-prism": {
      const points = [
        [1.2, 0, 1.2],
        [-0.6, 1.04, 1.2],
        [-0.6, -1.04, 1.2],
        [1.2, 0, -1.2],
        [-0.6, 1.04, -1.2],
        [-0.6, -1.04, -1.2],
      ];
      return baseSegments(points, [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
        [0, 3],
        [1, 4],
        [2, 5],
      ]);
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
      return baseSegments(points, [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
        [0, 3],
        [1, 4],
        [2, 5],
      ]);
    }
    case "hexagonal-prism": {
      const points = prismPoints(6, 1.1, 1.25);
      return baseSegments(points, prismEdges(6));
    }
    case "hexagonal-dipyramid": {
      const ring: number[][] = [];
      for (let index = 0; index < 6; index += 1) {
        const angle = (index / 6) * Math.PI * 2;
        ring.push([Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, 0]);
      }
      const points = [...ring, [0, 0, 1.7], [0, 0, -1.7]];
      return baseSegments(points, [
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
      ]);
    }
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
      return baseSegments(points, [
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
      ]);
    }
    case "tetrahedron": {
      const points = [
        [1.2, 1.2, 1.2],
        [-1.2, -1.2, 1.2],
        [-1.2, 1.2, -1.2],
        [1.2, -1.2, -1.2],
      ];
      return baseSegments(points, [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
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
      return baseSegments(points, [
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
      ]);
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
      return baseSegments(points, [
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
      ]);
    }
  }
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

  setCrystal(crystalClass: CrystalClass, visibleIds: Set<string>) {
    this.root.clear();

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
