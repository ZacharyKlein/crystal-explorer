# Crystal Symmetry Explorer

Crystal Symmetry Explorer is a simple public-facing web app for demonstrating and teaching crystal symmetry. It lets users browse the 32 crystallographic point groups, organized by the 7 crystal systems, and inspect each class through an interactive 3D viewer and a companion stereographic projection diagram.

## Basic Functionality

- Browse all 32 crystal classes grouped by crystal system.
- View each selected class as an interactive 3D wireframe model.
- Rotate and zoom the crystal model in the browser.
- Toggle symmetry elements on and off, including:
  - rotation axes
  - mirror planes
  - inversion centers
  - rotoinversion axes
- Add a solid crystal skin layer over the wireframe and adjust its opacity with a percentage slider.
- View a stereographic projection diagram for the currently selected crystal class in the right-hand panel.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Contact

Zachary Klein  
University of North Dakota  
[zachary.klein.1@ndus.edu](mailto:zachary.klein.1@ndus.edu)
