import type { CrystalClass, SymmetryElement, Vec3 } from "./data";

const size = 320;
const center = size / 2;
const radius = 118;

const colors = {
  rotation: "#f7a55f",
  mirror: "#7fd6ff",
  inversion: "#fff28d",
  rotoinversion: "#fb7ea8",
};

interface Point2D {
  x: number;
  y: number;
}

const normalize = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
};

const orientUpperHemisphere = (vector: Vec3): Vec3 => {
  const normalized = normalize(vector);
  return normalized[2] < 0 ? [-normalized[0], -normalized[1], -normalized[2]] : normalized;
};

const projectToPrimitive = (vector: Vec3): Point2D => {
  const [x, y, z] = orientUpperHemisphere(vector);
  const scale = radius / (1 + z);
  return {
    x: center + x * scale,
    y: center - y * scale,
  };
};

const format = (value: number) => value.toFixed(2);

const circle = (cx: number, cy: number, r: number, extra = "") =>
  `<circle cx="${format(cx)}" cy="${format(cy)}" r="${format(r)}" ${extra}/>`;

const line = (x1: number, y1: number, x2: number, y2: number, extra = "") =>
  `<line x1="${format(x1)}" y1="${format(y1)}" x2="${format(x2)}" y2="${format(y2)}" ${extra}/>`;

const text = (x: number, y: number, value: string, extra = "") =>
  `<text x="${format(x)}" y="${format(y)}" ${extra}>${value}</text>`;

const createMirrorPath = (normal: Vec3) => {
  const n = orientUpperHemisphere(normal);
  const reference: Vec3 = Math.abs(n[2]) < 0.92 ? [0, 0, 1] : [1, 0, 0];
  const u = normalize([
    n[1] * reference[2] - n[2] * reference[1],
    n[2] * reference[0] - n[0] * reference[2],
    n[0] * reference[1] - n[1] * reference[0],
  ]);
  const v = normalize([
    n[1] * u[2] - n[2] * u[1],
    n[2] * u[0] - n[0] * u[2],
    n[0] * u[1] - n[1] * u[0],
  ]);

  const pathPoints: Point2D[] = [];
  for (let step = 0; step <= 240; step += 1) {
    const theta = (Math.PI * 2 * step) / 240;
    const point: Vec3 = [
      u[0] * Math.cos(theta) + v[0] * Math.sin(theta),
      u[1] * Math.cos(theta) + v[1] * Math.sin(theta),
      u[2] * Math.cos(theta) + v[2] * Math.sin(theta),
    ];
    if (point[2] >= -0.001) {
      pathPoints.push(projectToPrimitive(point));
    }
  }

  if (pathPoints.length < 2) {
    return "";
  }

  return pathPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${format(point.x)} ${format(point.y)}`)
    .join(" ");
};

const axisMarker = (element: SymmetryElement) => {
  const point = projectToPrimitive(element.direction ?? [0, 0, 1]);
  const color = element.type === "rotoinversion" ? colors.rotoinversion : colors.rotation;
  const stroke = element.type === "rotoinversion" ? "#ffd0df" : "#ffe2be";
  const label = String(element.order ?? "");

  if (element.type === "rotoinversion") {
    const d = 11;
    return `
      <path d="M ${format(point.x)} ${format(point.y - d)} L ${format(point.x + d)} ${format(point.y)} L ${format(point.x)} ${format(point.y + d)} L ${format(point.x - d)} ${format(point.y)} Z"
        fill="${color}" stroke="${stroke}" stroke-width="1.6"/>
      ${text(point.x, point.y + 4, label, 'fill="#081016" font-size="12" font-weight="700" text-anchor="middle"')}
    `;
  }

  return `
    ${circle(point.x, point.y, 10, `fill="${color}" stroke="#ffe2be" stroke-width="1.6"`)}
    ${text(point.x, point.y + 4, label, 'fill="#081016" font-size="12" font-weight="700" text-anchor="middle"')}
  `;
};

const inversionMarker = () => `
  ${circle(center, center, 9, `fill="${colors.inversion}" stroke="#fbf3ba" stroke-width="1.6"`)}
  ${line(center - 6, center, center + 6, center, 'stroke="#655d1f" stroke-width="1.8" stroke-linecap="round"')}
  ${line(center, center - 6, center, center + 6, 'stroke="#655d1f" stroke-width="1.8" stroke-linecap="round"')}
`;

const legendChip = (x: number, y: number, color: string, label: string) => `
  ${circle(x, y, 5, `fill="${color}"`)}
  ${text(x + 12, y + 4, label, 'fill="#b8c5cf" font-size="11"')}
`;

export const renderStereogram = (crystalClass: CrystalClass) => {
  const mirrorPaths = crystalClass.elements
    .filter((element) => element.type === "mirror" && element.normal)
    .map((element) => createMirrorPath(element.normal as Vec3))
    .filter(Boolean)
    .map(
      (path) =>
        `<path d="${path}" fill="none" stroke="${colors.mirror}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>`,
    )
    .join("");

  const axisMarkers = crystalClass.elements
    .filter((element) => (element.type === "rotation" || element.type === "rotoinversion") && element.direction)
    .map((element) => axisMarker(element))
    .join("");

  const inversionMarkers = crystalClass.elements
    .filter((element) => element.type === "inversion")
    .map(() => inversionMarker())
    .join("");

  const identityFallback =
    crystalClass.elements.length === 0
      ? text(center, center + 4, "1", 'fill="#f4efe8" font-size="28" font-weight="700" text-anchor="middle"')
      : "";

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Stereographic projection for ${crystalClass.hmSymbol}">
      <defs>
        <radialGradient id="stereoBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.06)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.01)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${size}" height="${size}" rx="28" fill="transparent"/>
      ${circle(center, center, radius, 'fill="rgba(255,255,255,0.03)" stroke="rgba(165,193,211,0.26)" stroke-width="2"')}
      ${circle(center, center, radius * 0.5, 'fill="none" stroke="rgba(165,193,211,0.13)" stroke-width="1.2" stroke-dasharray="5 7"')}
      ${line(center - radius, center, center + radius, center, 'stroke="rgba(165,193,211,0.14)" stroke-width="1.2" stroke-dasharray="5 7"')}
      ${line(center, center - radius, center, center + radius, 'stroke="rgba(165,193,211,0.14)" stroke-width="1.2" stroke-dasharray="5 7"')}
      ${mirrorPaths}
      ${axisMarkers}
      ${inversionMarkers}
      ${identityFallback}
      ${text(center, 28, crystalClass.hmSymbol, 'fill="#f4efe8" font-size="20" font-weight="700" text-anchor="middle"')}
      ${text(center, 46, crystalClass.name, 'fill="#b8c5cf" font-size="11.5" text-anchor="middle"')}
      ${legendChip(36, size - 42, colors.rotation, "rotation")}
      ${legendChip(112, size - 42, colors.rotoinversion, "rotoinv.")}
      ${legendChip(204, size - 42, colors.mirror, "mirror")}
      ${legendChip(268, size - 42, colors.inversion, "inversion")}
    </svg>
  `;
};
