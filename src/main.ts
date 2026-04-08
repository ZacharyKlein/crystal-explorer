import "./styles.css";
import { groupedPointGroups, pointGroups, type CrystalClass, type SymmetryElementType } from "./data";
import { renderStereogram } from "./stereogram";
import { CrystalViewer } from "./viewer";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

const typeLabels: Record<SymmetryElementType, string> = {
  rotation: "Rotation axes",
  mirror: "Mirror planes",
  inversion: "Inversion center",
  rotoinversion: "Rotoinversion axes",
};

const typeDescriptions: Record<SymmetryElementType, string> = {
  rotation: "Show proper rotation axes.",
  mirror: "Show reflective planes.",
  inversion: "Show centers of inversion.",
  rotoinversion: "Show improper rotation axes.",
};

const state = {
  selectedId: pointGroups[0].id,
  elementVisibility: new Set<string>(),
  skinEnabled: false,
  skinOpacityPercent: 70,
  typeVisibility: {
    rotation: true,
    mirror: true,
    inversion: true,
    rotoinversion: true,
  } as Record<SymmetryElementType, boolean>,
};

const findCrystalClass = (id: string) => pointGroups.find((item) => item.id === id) ?? pointGroups[0];

const seedElementVisibility = (crystalClass: CrystalClass) => {
  state.elementVisibility = new Set(crystalClass.elements.map((element) => element.id));
};

seedElementVisibility(findCrystalClass(state.selectedId));

app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <p class="eyebrow">Teaching Web App</p>
        <h1>Crystal Symmetry Explorer</h1>
        <p class="intro">
          Browse all 32 crystallographic point groups, compare them by crystal system,
          and turn individual symmetry elements on or off in a live 3D wireframe scene.
        </p>
      </div>
      <div class="system-list" id="system-list"></div>
    </aside>
    <main class="main-panel">
      <section class="viewer-grid">
        <div class="viewer-card">
          <div class="viewer-header">
            <div>
              <p class="eyebrow">3D Model</p>
              <h3 id="class-title"></h3>
              <p id="class-subtitle" class="subtitle"></p>
              <p id="class-description" class="description viewer-description"></p>
            </div>
          </div>
          <div class="viewer-frame" id="viewer"></div>
        </div>
        <div class="control-card">
          <div class="control-block">
            <p class="eyebrow">Stereographic Projection</p>
            <div id="stereogram-panel" class="stereogram-panel"></div>
          </div>
          <div class="control-block">
            <p class="eyebrow">Crystal Skin</p>
            <div id="skin-control" class="skin-control">
              <label class="toggle-row skin-toggle-row">
                <input type="checkbox" id="skin-toggle" ${state.skinEnabled ? "checked" : ""} />
                <span>
                  <strong>Show solid surface</strong>
                </span>
              </label>
              <label class="slider-row skin-slider-row" for="skin-opacity">
                <span>
                  <strong>Surface opacity</strong>
                </span>
                <div class="slider-inputs">
                  <input
                    id="skin-opacity"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value="${state.skinOpacityPercent}"
                  />
                  <output id="skin-opacity-value">${state.skinOpacityPercent}%</output>
                </div>
              </label>
            </div>
          </div>
          <div class="control-block">
            <p class="eyebrow">Element Types</p>
            <div id="type-toggles" class="toggle-list"></div>
          </div>
          <div class="control-block">
            <p class="eyebrow">Elements In This Class</p>
            <div id="element-toggles" class="toggle-list detail-list"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
`;

const systemList = document.querySelector<HTMLDivElement>("#system-list");
const viewerHost = document.querySelector<HTMLDivElement>("#viewer");
const classTitle = document.querySelector<HTMLHeadingElement>("#class-title");
const classSubtitle = document.querySelector<HTMLParagraphElement>("#class-subtitle");
const classDescription = document.querySelector<HTMLParagraphElement>("#class-description");
const typeToggles = document.querySelector<HTMLDivElement>("#type-toggles");
const elementToggles = document.querySelector<HTMLDivElement>("#element-toggles");
const skinControl = document.querySelector<HTMLDivElement>("#skin-control");
const skinToggle = document.querySelector<HTMLInputElement>("#skin-toggle");
const skinOpacity = document.querySelector<HTMLInputElement>("#skin-opacity");
const skinOpacityValue = document.querySelector<HTMLOutputElement>("#skin-opacity-value");
const stereogramPanel = document.querySelector<HTMLDivElement>("#stereogram-panel");

if (
  !systemList ||
  !viewerHost ||
  !classTitle ||
  !classSubtitle ||
  !classDescription ||
  !typeToggles ||
  !elementToggles ||
  !skinControl ||
  !skinToggle ||
  !skinOpacity ||
  !skinOpacityValue ||
  !stereogramPanel
) {
  throw new Error("App layout failed to render");
}

const viewer = new CrystalViewer(viewerHost);

const visibleElementIdsFor = (crystalClass: CrystalClass) =>
  new Set(
    crystalClass.elements
      .filter((element) => state.typeVisibility[element.type] && state.elementVisibility.has(element.id))
      .map((element) => element.id),
  );

const renderSystemList = () => {
  systemList.innerHTML = groupedPointGroups
    .map(
      ({ system, classes }) => `
        <section class="system-section">
          <div class="system-header">
            <h2>${system}</h2>
            <span>${classes.length}</span>
          </div>
          <div class="class-buttons">
            ${classes
              .map(
                (crystalClass) => `
                  <button
                    class="class-button ${crystalClass.id === state.selectedId ? "active" : ""}"
                    data-class-id="${crystalClass.id}"
                    type="button"
                  >
                    <span class="symbol">${crystalClass.hmSymbol}</span>
                    <span class="meta">${crystalClass.name}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
};

const renderTypeToggles = () => {
  typeToggles.innerHTML = (Object.keys(typeLabels) as SymmetryElementType[])
    .map(
      (type) => `
        <label class="toggle-row">
          <input type="checkbox" data-type-toggle="${type}" ${state.typeVisibility[type] ? "checked" : ""} />
          <span>
            <strong>${typeLabels[type]}</strong>
            <small>${typeDescriptions[type]}</small>
          </span>
        </label>
      `,
    )
    .join("");
};

const renderSelectedClass = () => {
  const crystalClass = findCrystalClass(state.selectedId);
  classTitle.textContent = `${crystalClass.hmSymbol} · ${crystalClass.name}`;
  classSubtitle.textContent = `${crystalClass.system} crystal system`;
  classDescription.textContent = crystalClass.description;
  stereogramPanel.innerHTML = renderStereogram(crystalClass);

  if (crystalClass.elements.length === 0) {
    elementToggles.innerHTML = `<p class="empty-state">This class only has the identity operation, so there are no extra symmetry elements to highlight.</p>`;
  } else {
    elementToggles.innerHTML = crystalClass.elements
      .map(
        (element) => `
          <label class="toggle-row">
            <input
              type="checkbox"
              data-element-toggle="${element.id}"
              ${state.elementVisibility.has(element.id) ? "checked" : ""}
            />
            <span>
              <strong>${element.label}</strong>
              <small>${element.description}</small>
            </span>
          </label>
        `,
      )
      .join("");
  }

  skinToggle.checked = state.skinEnabled;
  skinOpacity.value = String(state.skinOpacityPercent);
  skinOpacityValue.value = `${state.skinOpacityPercent}%`;
  skinOpacity.disabled = !state.skinEnabled;
  skinControl.classList.toggle("is-disabled", !state.skinEnabled);

  viewer.setCrystal(
    crystalClass,
    visibleElementIdsFor(crystalClass),
    state.skinEnabled ? state.skinOpacityPercent / 100 : 0,
  );
};

renderSystemList();
renderTypeToggles();
renderSelectedClass();

systemList.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("[data-class-id]");
  if (!button) {
    return;
  }

  const nextClass = findCrystalClass(button.dataset.classId ?? state.selectedId);
  state.selectedId = nextClass.id;
  seedElementVisibility(nextClass);
  renderSystemList();
  renderSelectedClass();
});

typeToggles.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  const type = input.dataset.typeToggle as SymmetryElementType | undefined;
  if (!type) {
    return;
  }
  state.typeVisibility[type] = input.checked;
  renderSelectedClass();
});

skinToggle.addEventListener("change", () => {
  state.skinEnabled = skinToggle.checked;
  renderSelectedClass();
});

skinOpacity.addEventListener("input", () => {
  state.skinOpacityPercent = Number.parseInt(skinOpacity.value, 10);
  renderSelectedClass();
});

elementToggles.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  const elementId = input.dataset.elementToggle;
  if (!elementId) {
    return;
  }

  if (input.checked) {
    state.elementVisibility.add(elementId);
  } else {
    state.elementVisibility.delete(elementId);
  }

  renderSelectedClass();
});
window.addEventListener("beforeunload", () => {
  viewer.dispose();
});
