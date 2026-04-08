export type CrystalSystem =
  | "triclinic"
  | "monoclinic"
  | "orthorhombic"
  | "tetragonal"
  | "trigonal"
  | "hexagonal"
  | "cubic";

export type SymmetryElementType =
  | "rotation"
  | "mirror"
  | "inversion"
  | "rotoinversion";

export type Vec3 = [number, number, number];

export type WireframePreset =
  | "triclinic-cell"
  | "monoclinic-prism"
  | "orthorhombic-disphenoid"
  | "orthorhombic-pyramid"
  | "orthorhombic-prism"
  | "orthorhombic-dipyramid"
  | "tetragonal-pyramid"
  | "tetragonal-disphenoid"
  | "tetragonal-prism"
  | "tetragonal-trapezohedron"
  | "tetragonal-dipyramid"
  | "ditetragonal-pyramid"
  | "ditetragonal-dipyramid"
  | "trigonal-pyramid"
  | "trigonal-prism"
  | "trigonal-trapezohedron"
  | "ditrigonal-pyramid"
  | "ditrigonal-dipyramid"
  | "trigonal-rhombohedron"
  | "hexagonal-pyramid"
  | "hexagonal-prism"
  | "hexagonal-trapezohedron"
  | "hexagonal-dipyramid"
  | "dihexagonal-pyramid"
  | "dihexagonal-dipyramid"
  | "cube"
  | "tetrahedron"
  | "octahedron"
  | "cuboctahedron";

export interface SymmetryElement {
  id: string;
  type: SymmetryElementType;
  label: string;
  description: string;
  direction?: Vec3;
  normal?: Vec3;
  order?: number;
  offset?: number;
  radius?: number;
  size?: number;
}

export interface CrystalClass {
  id: string;
  hmSymbol: string;
  name: string;
  system: CrystalSystem;
  description: string;
  wireframePreset: WireframePreset;
  elements: SymmetryElement[];
}

const sqrt3 = Math.sqrt(3);

const x: Vec3 = [1, 0, 0];
const y: Vec3 = [0, 1, 0];
const z: Vec3 = [0, 0, 1];
const dxy: Vec3 = [1, 1, 0];
const dxmy: Vec3 = [1, -1, 0];
const a1: Vec3 = [1, 0, 0];
const a2: Vec3 = [-0.5, sqrt3 / 2, 0];
const a3: Vec3 = [-0.5, -sqrt3 / 2, 0];
const bd1: Vec3 = [1, 1, 1];
const bd2: Vec3 = [1, -1, 1];
const bd3: Vec3 = [-1, 1, 1];
const bd4: Vec3 = [-1, -1, 1];
const fd1: Vec3 = [1, 1, 0];
const fd2: Vec3 = [1, -1, 0];
const fd3: Vec3 = [1, 0, 1];
const fd4: Vec3 = [1, 0, -1];
const fd5: Vec3 = [0, 1, 1];
const fd6: Vec3 = [0, 1, -1];

const axis = (
  id: string,
  label: string,
  order: number,
  direction: Vec3,
  description: string,
): SymmetryElement => ({
  id,
  type: "rotation",
  label,
  order,
  direction,
  description,
});

const mirror = (
  id: string,
  label: string,
  normal: Vec3,
  description: string,
): SymmetryElement => ({
  id,
  type: "mirror",
  label,
  normal,
  description,
});

const inversion = (id = "inv"): SymmetryElement => ({
  id,
  type: "inversion",
  label: "Inversion center",
  description: "Maps each point through the crystal center to its opposite position.",
});

const roto = (
  id: string,
  label: string,
  order: number,
  direction: Vec3,
  description: string,
): SymmetryElement => ({
  id,
  type: "rotoinversion",
  label,
  order,
  direction,
  description,
});

export const crystalSystems: CrystalSystem[] = [
  "triclinic",
  "monoclinic",
  "orthorhombic",
  "tetragonal",
  "trigonal",
  "hexagonal",
  "cubic",
];

export const pointGroups: CrystalClass[] = [
  {
    id: "1",
    hmSymbol: "1",
    name: "Pedial",
    system: "triclinic",
    description: "The identity-only class. It has no symmetry elements beyond doing nothing.",
    wireframePreset: "triclinic-cell",
    elements: [],
  },
  {
    id: "-1",
    hmSymbol: "-1",
    name: "Pinacoidal",
    system: "triclinic",
    description: "The centrosymmetric triclinic class with only an inversion center.",
    wireframePreset: "triclinic-cell",
    elements: [inversion()],
  },
  {
    id: "2",
    hmSymbol: "2",
    name: "Sphenoidal",
    system: "monoclinic",
    description: "A single twofold axis defines this monoclinic class.",
    wireframePreset: "monoclinic-prism",
    elements: [axis("c2-b", "2-fold axis", 2, y, "A twofold rotation axis parallel to the unique monoclinic axis.")],
  },
  {
    id: "m",
    hmSymbol: "m",
    name: "Domatic",
    system: "monoclinic",
    description: "This class has a single mirror plane and no rotational symmetry higher than identity.",
    wireframePreset: "monoclinic-prism",
    elements: [mirror("m-perp-b", "Mirror plane", y, "A mirror plane perpendicular to the unique monoclinic axis.")],
  },
  {
    id: "2/m",
    hmSymbol: "2/m",
    name: "Prismatic",
    system: "monoclinic",
    description: "Combines a twofold axis, a perpendicular mirror plane, and a center of inversion.",
    wireframePreset: "monoclinic-prism",
    elements: [
      axis("c2-b", "2-fold axis", 2, y, "A twofold rotation axis parallel to the unique monoclinic axis."),
      mirror("m-perp-b", "Mirror plane", y, "A mirror plane perpendicular to the unique monoclinic axis."),
      inversion(),
    ],
  },
  {
    id: "222",
    hmSymbol: "222",
    name: "Rhombic-disphenoidal",
    system: "orthorhombic",
    description: "Three mutually perpendicular twofold axes define the rotational symmetry.",
    wireframePreset: "orthorhombic-disphenoid",
    elements: [
      axis("c2-x", "2-fold axis a", 2, x, "Twofold axis parallel to a."),
      axis("c2-y", "2-fold axis b", 2, y, "Twofold axis parallel to b."),
      axis("c2-z", "2-fold axis c", 2, z, "Twofold axis parallel to c."),
    ],
  },
  {
    id: "mm2",
    hmSymbol: "mm2",
    name: "Rhombic-pyramidal",
    system: "orthorhombic",
    description: "Two perpendicular mirror planes intersect in a twofold axis.",
    wireframePreset: "orthorhombic-pyramid",
    elements: [
      mirror("m-x", "Mirror plane yz", x, "Mirror plane parallel to b and c."),
      mirror("m-y", "Mirror plane xz", y, "Mirror plane parallel to a and c."),
      axis("c2-z", "2-fold axis c", 2, z, "Twofold axis along the line where the mirror planes intersect."),
    ],
  },
  {
    id: "mmm",
    hmSymbol: "mmm",
    name: "Rhombic-dipyramidal",
    system: "orthorhombic",
    description: "The holohedral orthorhombic class with three perpendicular twofold axes, three mirror planes, and inversion.",
    wireframePreset: "orthorhombic-dipyramid",
    elements: [
      axis("c2-x", "2-fold axis a", 2, x, "Twofold axis parallel to a."),
      axis("c2-y", "2-fold axis b", 2, y, "Twofold axis parallel to b."),
      axis("c2-z", "2-fold axis c", 2, z, "Twofold axis parallel to c."),
      mirror("m-x", "Mirror plane yz", x, "Mirror plane parallel to b and c."),
      mirror("m-y", "Mirror plane xz", y, "Mirror plane parallel to a and c."),
      mirror("m-z", "Mirror plane xy", z, "Mirror plane parallel to a and b."),
      inversion(),
    ],
  },
  {
    id: "4",
    hmSymbol: "4",
    name: "Tetragonal-pyramidal",
    system: "tetragonal",
    description: "A single fourfold axis controls the tetragonal symmetry.",
    wireframePreset: "tetragonal-pyramid",
    elements: [axis("c4-z", "4-fold axis", 4, z, "A fourfold rotation axis along c.")],
  },
  {
    id: "-4",
    hmSymbol: "-4",
    name: "Tetragonal-disphenoidal",
    system: "tetragonal",
    description: "Its defining element is a fourfold rotoinversion axis.",
    wireframePreset: "tetragonal-disphenoid",
    elements: [roto("s4-z", "4-fold rotoinversion axis", 4, z, "A fourfold rotoinversion axis along c.")],
  },
  {
    id: "4/m",
    hmSymbol: "4/m",
    name: "Tetragonal-dipyramidal",
    system: "tetragonal",
    description: "A fourfold axis together with a horizontal mirror plane produces centrosymmetry.",
    wireframePreset: "tetragonal-dipyramid",
    elements: [
      axis("c4-z", "4-fold axis", 4, z, "A fourfold rotation axis along c."),
      mirror("m-z", "Horizontal mirror plane", z, "Mirror plane perpendicular to the tetragonal axis."),
      inversion(),
    ],
  },
  {
    id: "422",
    hmSymbol: "422",
    name: "Tetragonal-trapezohedral",
    system: "tetragonal",
    description: "One fourfold axis is accompanied by four perpendicular twofold axes.",
    wireframePreset: "tetragonal-trapezohedron",
    elements: [
      axis("c4-z", "4-fold axis", 4, z, "Primary fourfold axis along c."),
      axis("c2-x", "2-fold axis a", 2, x, "Secondary twofold axis in the basal plane."),
      axis("c2-y", "2-fold axis b", 2, y, "Secondary twofold axis in the basal plane."),
      axis("c2-d1", "2-fold diagonal axis", 2, dxy, "Diagonal twofold axis in the basal plane."),
      axis("c2-d2", "2-fold diagonal axis", 2, dxmy, "Diagonal twofold axis in the basal plane."),
    ],
  },
  {
    id: "4mm",
    hmSymbol: "4mm",
    name: "Ditetragonal-pyramidal",
    system: "tetragonal",
    description: "Four vertical mirror planes accompany the principal fourfold axis.",
    wireframePreset: "ditetragonal-pyramid",
    elements: [
      axis("c4-z", "4-fold axis", 4, z, "Primary fourfold axis along c."),
      mirror("m-x", "Vertical mirror plane yz", x, "Vertical mirror plane containing c."),
      mirror("m-y", "Vertical mirror plane xz", y, "Vertical mirror plane containing c."),
      mirror("m-d1", "Diagonal mirror plane", dxy, "Vertical diagonal mirror plane containing c."),
      mirror("m-d2", "Diagonal mirror plane", dxmy, "Vertical diagonal mirror plane containing c."),
    ],
  },
  {
    id: "-42m",
    hmSymbol: "-42m",
    name: "Tetragonal-scalenohedral",
    system: "tetragonal",
    description: "A fourfold rotoinversion axis is paired with twofold axes and diagonal mirror planes.",
    wireframePreset: "tetragonal-trapezohedron",
    elements: [
      roto("s4-z", "4-fold rotoinversion axis", 4, z, "Primary fourfold rotoinversion axis along c."),
      axis("c2-x", "2-fold axis a", 2, x, "Secondary twofold axis in the basal plane."),
      axis("c2-y", "2-fold axis b", 2, y, "Secondary twofold axis in the basal plane."),
      mirror("m-d1", "Diagonal mirror plane", dxy, "Diagonal mirror plane containing c."),
      mirror("m-d2", "Diagonal mirror plane", dxmy, "Diagonal mirror plane containing c."),
    ],
  },
  {
    id: "4/mmm",
    hmSymbol: "4/mmm",
    name: "Ditetragonal-dipyramidal",
    system: "tetragonal",
    description: "The holohedral tetragonal class combines the full rotational, mirror, and inversion content of the tetragonal system.",
    wireframePreset: "ditetragonal-dipyramid",
    elements: [
      axis("c4-z", "4-fold axis", 4, z, "Primary fourfold axis along c."),
      axis("c2-x", "2-fold axis a", 2, x, "Secondary twofold axis in the basal plane."),
      axis("c2-y", "2-fold axis b", 2, y, "Secondary twofold axis in the basal plane."),
      axis("c2-d1", "2-fold diagonal axis", 2, dxy, "Diagonal twofold axis in the basal plane."),
      axis("c2-d2", "2-fold diagonal axis", 2, dxmy, "Diagonal twofold axis in the basal plane."),
      mirror("m-z", "Horizontal mirror plane", z, "Mirror plane perpendicular to c."),
      mirror("m-x", "Vertical mirror plane yz", x, "Vertical mirror plane containing c."),
      mirror("m-y", "Vertical mirror plane xz", y, "Vertical mirror plane containing c."),
      mirror("m-d1", "Diagonal mirror plane", dxy, "Diagonal mirror plane containing c."),
      mirror("m-d2", "Diagonal mirror plane", dxmy, "Diagonal mirror plane containing c."),
      inversion(),
    ],
  },
  {
    id: "3",
    hmSymbol: "3",
    name: "Trigonal-pyramidal",
    system: "trigonal",
    description: "A single threefold axis defines the simplest trigonal class.",
    wireframePreset: "trigonal-pyramid",
    elements: [axis("c3-z", "3-fold axis", 3, z, "Primary threefold axis along c.")],
  },
  {
    id: "-3",
    hmSymbol: "-3",
    name: "Rhombohedral",
    system: "trigonal",
    description: "The defining element is a threefold rotoinversion axis.",
    wireframePreset: "trigonal-rhombohedron",
    elements: [roto("s3-z", "3-fold rotoinversion axis", 3, z, "Threefold rotoinversion axis along c.")],
  },
  {
    id: "32",
    hmSymbol: "32",
    name: "Trigonal-trapezohedral",
    system: "trigonal",
    description: "A threefold axis is paired with three perpendicular twofold axes in the basal plane.",
    wireframePreset: "trigonal-trapezohedron",
    elements: [
      axis("c3-z", "3-fold axis", 3, z, "Primary threefold axis along c."),
      axis("c2-a1", "2-fold axis a1", 2, a1, "Twofold axis in the basal plane."),
      axis("c2-a2", "2-fold axis a2", 2, a2, "Twofold axis in the basal plane."),
      axis("c2-a3", "2-fold axis a3", 2, a3, "Twofold axis in the basal plane."),
    ],
  },
  {
    id: "3m",
    hmSymbol: "3m",
    name: "Ditrigonal-pyramidal",
    system: "trigonal",
    description: "A threefold axis accompanied by three vertical mirror planes.",
    wireframePreset: "ditrigonal-pyramid",
    elements: [
      axis("c3-z", "3-fold axis", 3, z, "Primary threefold axis along c."),
      mirror("m-a1", "Vertical mirror plane", a1, "Vertical mirror plane containing c."),
      mirror("m-a2", "Vertical mirror plane", a2, "Vertical mirror plane containing c."),
      mirror("m-a3", "Vertical mirror plane", a3, "Vertical mirror plane containing c."),
    ],
  },
  {
    id: "-3m",
    hmSymbol: "-3m",
    name: "Ditrigonal-scalenohedral",
    system: "trigonal",
    description: "The holohedral trigonal class includes a threefold rotoinversion axis plus mirror content.",
    wireframePreset: "ditrigonal-dipyramid",
    elements: [
      roto("s3-z", "3-fold rotoinversion axis", 3, z, "Threefold rotoinversion axis along c."),
      axis("c2-a1", "2-fold axis a1", 2, a1, "Twofold axis in the basal plane."),
      axis("c2-a2", "2-fold axis a2", 2, a2, "Twofold axis in the basal plane."),
      axis("c2-a3", "2-fold axis a3", 2, a3, "Twofold axis in the basal plane."),
      mirror("m-a1", "Vertical mirror plane", a1, "Vertical mirror plane containing c."),
      mirror("m-a2", "Vertical mirror plane", a2, "Vertical mirror plane containing c."),
      mirror("m-a3", "Vertical mirror plane", a3, "Vertical mirror plane containing c."),
    ],
  },
  {
    id: "6",
    hmSymbol: "6",
    name: "Hexagonal-pyramidal",
    system: "hexagonal",
    description: "A single sixfold axis defines this hexagonal class.",
    wireframePreset: "hexagonal-pyramid",
    elements: [axis("c6-z", "6-fold axis", 6, z, "Primary sixfold axis along c.")],
  },
  {
    id: "-6",
    hmSymbol: "-6",
    name: "Trigonal-dipyramidal",
    system: "hexagonal",
    description: "Its defining element is a sixfold rotoinversion axis.",
    wireframePreset: "ditrigonal-dipyramid",
    elements: [roto("s6-z", "6-fold rotoinversion axis", 6, z, "Sixfold rotoinversion axis along c.")],
  },
  {
    id: "6/m",
    hmSymbol: "6/m",
    name: "Hexagonal-dipyramidal",
    system: "hexagonal",
    description: "A sixfold axis and a horizontal mirror plane make the class centrosymmetric.",
    wireframePreset: "hexagonal-dipyramid",
    elements: [
      axis("c6-z", "6-fold axis", 6, z, "Primary sixfold axis along c."),
      mirror("m-z", "Horizontal mirror plane", z, "Mirror plane perpendicular to c."),
      inversion(),
    ],
  },
  {
    id: "622",
    hmSymbol: "622",
    name: "Hexagonal-trapezohedral",
    system: "hexagonal",
    description: "A sixfold axis is paired with six twofold axes in the basal plane.",
    wireframePreset: "hexagonal-trapezohedron",
    elements: [
      axis("c6-z", "6-fold axis", 6, z, "Primary sixfold axis along c."),
      axis("c2-a1", "2-fold axis a1", 2, a1, "Twofold axis in the basal plane."),
      axis("c2-a2", "2-fold axis a2", 2, a2, "Twofold axis in the basal plane."),
      axis("c2-a3", "2-fold axis a3", 2, a3, "Twofold axis in the basal plane."),
      axis("c2-d1", "2-fold axis", 2, [sqrt3 / 2, 0.5, 0], "Twofold axis in the basal plane."),
      axis("c2-d2", "2-fold axis", 2, [0, 1, 0], "Twofold axis in the basal plane."),
      axis("c2-d3", "2-fold axis", 2, [-sqrt3 / 2, 0.5, 0], "Twofold axis in the basal plane."),
    ],
  },
  {
    id: "6mm",
    hmSymbol: "6mm",
    name: "Dihexagonal-pyramidal",
    system: "hexagonal",
    description: "Six vertical mirror planes accompany the principal sixfold axis.",
    wireframePreset: "dihexagonal-pyramid",
    elements: [
      axis("c6-z", "6-fold axis", 6, z, "Primary sixfold axis along c."),
      mirror("m-a1", "Vertical mirror plane", a1, "Vertical mirror plane containing c."),
      mirror("m-a2", "Vertical mirror plane", a2, "Vertical mirror plane containing c."),
      mirror("m-a3", "Vertical mirror plane", a3, "Vertical mirror plane containing c."),
      mirror("m-d1", "Vertical mirror plane", [sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
      mirror("m-d2", "Vertical mirror plane", [0, 1, 0], "Vertical mirror plane containing c."),
      mirror("m-d3", "Vertical mirror plane", [-sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
    ],
  },
  {
    id: "-6m2",
    hmSymbol: "-6m2",
    name: "Ditrigonal-dipyramidal",
    system: "hexagonal",
    description: "A sixfold rotoinversion axis is paired with mirror planes and basal twofold axes.",
    wireframePreset: "ditrigonal-dipyramid",
    elements: [
      roto("s6-z", "6-fold rotoinversion axis", 6, z, "Sixfold rotoinversion axis along c."),
      axis("c2-a1", "2-fold axis a1", 2, a1, "Twofold axis in the basal plane."),
      axis("c2-a2", "2-fold axis a2", 2, a2, "Twofold axis in the basal plane."),
      axis("c2-a3", "2-fold axis a3", 2, a3, "Twofold axis in the basal plane."),
      mirror("m-d1", "Vertical mirror plane", [sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
      mirror("m-d2", "Vertical mirror plane", [0, 1, 0], "Vertical mirror plane containing c."),
      mirror("m-d3", "Vertical mirror plane", [-sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
    ],
  },
  {
    id: "6/mmm",
    hmSymbol: "6/mmm",
    name: "Dihexagonal-dipyramidal",
    system: "hexagonal",
    description: "The holohedral hexagonal class with the full set of sixfold, twofold, mirror, and inversion symmetry.",
    wireframePreset: "dihexagonal-dipyramid",
    elements: [
      axis("c6-z", "6-fold axis", 6, z, "Primary sixfold axis along c."),
      axis("c2-a1", "2-fold axis a1", 2, a1, "Twofold axis in the basal plane."),
      axis("c2-a2", "2-fold axis a2", 2, a2, "Twofold axis in the basal plane."),
      axis("c2-a3", "2-fold axis a3", 2, a3, "Twofold axis in the basal plane."),
      axis("c2-d1", "2-fold axis", 2, [sqrt3 / 2, 0.5, 0], "Twofold axis in the basal plane."),
      axis("c2-d2", "2-fold axis", 2, [0, 1, 0], "Twofold axis in the basal plane."),
      axis("c2-d3", "2-fold axis", 2, [-sqrt3 / 2, 0.5, 0], "Twofold axis in the basal plane."),
      mirror("m-z", "Horizontal mirror plane", z, "Mirror plane perpendicular to c."),
      mirror("m-a1", "Vertical mirror plane", a1, "Vertical mirror plane containing c."),
      mirror("m-a2", "Vertical mirror plane", a2, "Vertical mirror plane containing c."),
      mirror("m-a3", "Vertical mirror plane", a3, "Vertical mirror plane containing c."),
      mirror("m-d1", "Vertical mirror plane", [sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
      mirror("m-d2", "Vertical mirror plane", [0, 1, 0], "Vertical mirror plane containing c."),
      mirror("m-d3", "Vertical mirror plane", [-sqrt3 / 2, 0.5, 0], "Vertical mirror plane containing c."),
      inversion(),
    ],
  },
  {
    id: "23",
    hmSymbol: "23",
    name: "Tetartoidal",
    system: "cubic",
    description: "Four threefold axes through the body diagonals combine with three mutually perpendicular twofold axes.",
    wireframePreset: "tetrahedron",
    elements: [
      axis("c3-bd1", "3-fold body diagonal", 3, bd1, "Threefold axis along a cube body diagonal."),
      axis("c3-bd2", "3-fold body diagonal", 3, bd2, "Threefold axis along a cube body diagonal."),
      axis("c3-bd3", "3-fold body diagonal", 3, bd3, "Threefold axis along a cube body diagonal."),
      axis("c3-bd4", "3-fold body diagonal", 3, bd4, "Threefold axis along a cube body diagonal."),
      axis("c2-x", "2-fold axis x", 2, x, "Twofold axis through opposite faces."),
      axis("c2-y", "2-fold axis y", 2, y, "Twofold axis through opposite faces."),
      axis("c2-z", "2-fold axis z", 2, z, "Twofold axis through opposite faces."),
    ],
  },
  {
    id: "m-3",
    hmSymbol: "m-3",
    name: "Diploidal",
    system: "cubic",
    description: "Adds inversion and mirror symmetry to the rotational core of the cubic system.",
    wireframePreset: "cube",
    elements: [
      axis("c3-bd1", "3-fold body diagonal", 3, bd1, "Threefold axis along a cube body diagonal."),
      axis("c3-bd2", "3-fold body diagonal", 3, bd2, "Threefold axis along a cube body diagonal."),
      axis("c3-bd3", "3-fold body diagonal", 3, bd3, "Threefold axis along a cube body diagonal."),
      axis("c3-bd4", "3-fold body diagonal", 3, bd4, "Threefold axis along a cube body diagonal."),
      axis("c2-x", "2-fold axis x", 2, x, "Twofold axis through opposite faces."),
      axis("c2-y", "2-fold axis y", 2, y, "Twofold axis through opposite faces."),
      axis("c2-z", "2-fold axis z", 2, z, "Twofold axis through opposite faces."),
      mirror("m-x", "Mirror plane yz", x, "Mirror plane parallel to cube faces."),
      mirror("m-y", "Mirror plane xz", y, "Mirror plane parallel to cube faces."),
      mirror("m-z", "Mirror plane xy", z, "Mirror plane parallel to cube faces."),
      inversion(),
    ],
  },
  {
    id: "432",
    hmSymbol: "432",
    name: "Gyroidal",
    system: "cubic",
    description: "Contains fourfold axes through cube faces, threefold axes through body diagonals, and twofold axes through edge centers.",
    wireframePreset: "octahedron",
    elements: [
      axis("c4-x", "4-fold axis x", 4, x, "Fourfold axis through opposite faces."),
      axis("c4-y", "4-fold axis y", 4, y, "Fourfold axis through opposite faces."),
      axis("c4-z", "4-fold axis z", 4, z, "Fourfold axis through opposite faces."),
      axis("c3-bd1", "3-fold body diagonal", 3, bd1, "Threefold axis along a body diagonal."),
      axis("c3-bd2", "3-fold body diagonal", 3, bd2, "Threefold axis along a body diagonal."),
      axis("c3-bd3", "3-fold body diagonal", 3, bd3, "Threefold axis along a body diagonal."),
      axis("c3-bd4", "3-fold body diagonal", 3, bd4, "Threefold axis along a body diagonal."),
      axis("c2-fd1", "2-fold edge-center axis", 2, fd1, "Twofold axis through opposite edge centers."),
      axis("c2-fd2", "2-fold edge-center axis", 2, fd2, "Twofold axis through opposite edge centers."),
      axis("c2-fd3", "2-fold edge-center axis", 2, fd3, "Twofold axis through opposite edge centers."),
      axis("c2-fd4", "2-fold edge-center axis", 2, fd4, "Twofold axis through opposite edge centers."),
      axis("c2-fd5", "2-fold edge-center axis", 2, fd5, "Twofold axis through opposite edge centers."),
      axis("c2-fd6", "2-fold edge-center axis", 2, fd6, "Twofold axis through opposite edge centers."),
    ],
  },
  {
    id: "-43m",
    hmSymbol: "-43m",
    name: "Hextetrahedral",
    system: "cubic",
    description: "Three fourfold rotoinversion axes coexist with four threefold axes and diagonal mirror planes.",
    wireframePreset: "tetrahedron",
    elements: [
      roto("s4-x", "4-fold rotoinversion axis x", 4, x, "Fourfold rotoinversion axis through opposite faces."),
      roto("s4-y", "4-fold rotoinversion axis y", 4, y, "Fourfold rotoinversion axis through opposite faces."),
      roto("s4-z", "4-fold rotoinversion axis z", 4, z, "Fourfold rotoinversion axis through opposite faces."),
      axis("c3-bd1", "3-fold body diagonal", 3, bd1, "Threefold axis along a body diagonal."),
      axis("c3-bd2", "3-fold body diagonal", 3, bd2, "Threefold axis along a body diagonal."),
      axis("c3-bd3", "3-fold body diagonal", 3, bd3, "Threefold axis along a body diagonal."),
      axis("c3-bd4", "3-fold body diagonal", 3, bd4, "Threefold axis along a body diagonal."),
      mirror("m-fd1", "Diagonal mirror plane", fd1, "Mirror plane passing through edge-center directions."),
      mirror("m-fd2", "Diagonal mirror plane", fd2, "Mirror plane passing through edge-center directions."),
      mirror("m-fd5", "Diagonal mirror plane", fd5, "Mirror plane passing through edge-center directions."),
      mirror("m-fd6", "Diagonal mirror plane", fd6, "Mirror plane passing through edge-center directions."),
      mirror("m-fd3", "Diagonal mirror plane", fd3, "Mirror plane passing through edge-center directions."),
      mirror("m-fd4", "Diagonal mirror plane", fd4, "Mirror plane passing through edge-center directions."),
    ],
  },
  {
    id: "m-3m",
    hmSymbol: "m-3m",
    name: "Hexoctahedral",
    system: "cubic",
    description: "The full cubic holohedral class. It displays the richest combination of rotation, mirror, inversion, and equivalent directions.",
    wireframePreset: "cuboctahedron",
    elements: [
      axis("c4-x", "4-fold axis x", 4, x, "Fourfold axis through opposite faces."),
      axis("c4-y", "4-fold axis y", 4, y, "Fourfold axis through opposite faces."),
      axis("c4-z", "4-fold axis z", 4, z, "Fourfold axis through opposite faces."),
      axis("c3-bd1", "3-fold body diagonal", 3, bd1, "Threefold axis along a body diagonal."),
      axis("c3-bd2", "3-fold body diagonal", 3, bd2, "Threefold axis along a body diagonal."),
      axis("c3-bd3", "3-fold body diagonal", 3, bd3, "Threefold axis along a body diagonal."),
      axis("c3-bd4", "3-fold body diagonal", 3, bd4, "Threefold axis along a body diagonal."),
      axis("c2-fd1", "2-fold edge-center axis", 2, fd1, "Twofold axis through opposite edge centers."),
      axis("c2-fd2", "2-fold edge-center axis", 2, fd2, "Twofold axis through opposite edge centers."),
      axis("c2-fd3", "2-fold edge-center axis", 2, fd3, "Twofold axis through opposite edge centers."),
      axis("c2-fd4", "2-fold edge-center axis", 2, fd4, "Twofold axis through opposite edge centers."),
      axis("c2-fd5", "2-fold edge-center axis", 2, fd5, "Twofold axis through opposite edge centers."),
      axis("c2-fd6", "2-fold edge-center axis", 2, fd6, "Twofold axis through opposite edge centers."),
      mirror("m-x", "Mirror plane yz", x, "Mirror plane parallel to cube faces."),
      mirror("m-y", "Mirror plane xz", y, "Mirror plane parallel to cube faces."),
      mirror("m-z", "Mirror plane xy", z, "Mirror plane parallel to cube faces."),
      mirror("m-fd1", "Diagonal mirror plane", fd1, "Diagonal mirror plane through edge-center directions."),
      mirror("m-fd2", "Diagonal mirror plane", fd2, "Diagonal mirror plane through edge-center directions."),
      mirror("m-fd3", "Diagonal mirror plane", fd3, "Diagonal mirror plane through edge-center directions."),
      mirror("m-fd4", "Diagonal mirror plane", fd4, "Diagonal mirror plane through edge-center directions."),
      mirror("m-fd5", "Diagonal mirror plane", fd5, "Diagonal mirror plane through edge-center directions."),
      mirror("m-fd6", "Diagonal mirror plane", fd6, "Diagonal mirror plane through edge-center directions."),
      inversion(),
    ],
  },
];

export const groupedPointGroups = crystalSystems.map((system) => ({
  system,
  classes: pointGroups.filter((pointGroup) => pointGroup.system === system),
}));
