# Enterprise Low-Code Campaign Platform

An enterprise-grade visual low-code platform for building and publishing interactive H5 campaign pages. Features a three-panel drag-and-drop editor powered by MobX reactive state management, a pluggable component system with runtime dynamic loading, and a full SSR publishing pipeline with graceful degradation.

## Architecture Overview

```
┌─────────────────────── Editor (React + MobX) ───────────────────────┐
│                                                                      │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  Left Panel  │    │   Canvas (Mid)    │    │   Right Panel      │  │
│  │  Component   │    │   Viewport        │    │   SettingsPanel    │  │
│  │  Library     │◄──►│   ├ Flow widgets  │◄──►│   ├ AttributePanel │  │
│  │  Widget      │    │   │ (sortable)    │    │   ├ StyleControls  │  │
│  │  Cards       │    │   └ Normal widgets│    │   └ ControlWrap    │  │
│  │              │    │     (Rnd: drag +  │    │     (dynamic form  │  │
│  │              │    │      resize)      │    │      renderer)     │  │
│  └──────┬───────┘    └────────┬─────────┘    └─────────┬──────────┘  │
│         │                     │                        │             │
│         └─────────────────────┼────────────────────────┘             │
│                               │                                      │
│                    ┌──────────▼──────────┐                           │
│                    │   StageStore (MobX)  │                           │
│                    │   Single Source of   │                           │
│                    │   Truth: Project →   │                           │
│                    │   Pages → Widgets    │                           │
│                    └─────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────┘
                               │
                          Publish Flow
                               │
                               ▼
┌─────────────────── Server (Koa + Node.js) ───────────────────────────┐
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐  │
│  │ jsdom + React │──►│renderToString│──►│ Handlebars Template      │  │
│  │ (Browser Env  │   │ (SSR HTML)   │   │ Embed mainHTML + PageData│  │
│  │  Simulation)  │   └──────────────┘   └────────────┬─────────────┘  │
│  └──────────────┘                                    │               │
│                                              Upload to CDN           │
│                                                      │               │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────── C-Side H5 Page ───────────────────────────────────┐
│                                                                       │
│  SSR HTML (instant paint) ──► ReactDOM.hydrate ──► Interactive Page   │
│                                                                       │
│  Fallback: if SSR fails ──► ReactDOM.render ──► Client-side render   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies | Purpose |
|-------|-------------|---------|
| **UI Framework** | React (Class Components) | Component rendering and lifecycle management |
| **State Management** | MobX (`@observable` / `@observer`) | Reactive data binding across editor panels |
| **Editor Interactions** | react-rnd, react-sortable-hoc | Drag/resize for free-position; drag-sort for flow layout |
| **UI Library** | Ant Design | Editor panel controls (Tabs, Modal, Input, Select, etc.) |
| **Styling** | Less, px2rem | Component styles with mobile-adaptive rem conversion |
| **Server** | Koa | RESTful API and SSR publish pipeline |
| **SSR** | ReactDOM.renderToString, jsdom | Server-side HTML generation |
| **Templating** | Handlebars | Embed SSR output into publishable HTML |
| **Database** | MongoDB | Project configs, component metadata, user data |
| **Build** | Webpack, Babel | Module bundling, ES6+/JSX transpilation |
| **Code Quality** | ESLint, Prettier, Husky | Linting and pre-commit hooks |
| **Containerization** | Docker, docker-compose | Local development and deployment |

## Core Technical Highlights

### 1. MobX-Driven Three-Panel Real-Time Communication

The editor's left (component library), middle (canvas), and right (property panel) panels communicate through a shared MobX observable data model rather than imperative event passing.

**Observable Data Model Hierarchy:**

```
StageStore (@observable)
├── project: Project
│   ├── pages: Page[]
│   │   ├── widgets: Widget[]      ← each widget has @observable data, isSelected, etc.
│   │   │   ├── layers: Layer[]
│   │   │   ├── triggers: Trigger[]
│   │   │   └── animations: Animation[]
│   │   └── variableStore           ← page-level variables
│   ├── variableStore               ← project-level variables
│   └── shareConfig: Share
├── stages: Stage[]                 ← editing context stack (project → page → layer)
└── activeTab: string               ← right panel active tab
```

**How it works:** All three panels are `@observer` components reading from the same `StageStore` instance. When the right panel modifies `widget.data.url`, MobX automatically notifies the canvas to re-render — no manual event dispatching, no prop drilling, no Redux action boilerplate.

**Key challenge solved:** MobX 4's `observable({})` does not track dynamically added properties. The solution re-assigns `widget.data` via spread operator (`this.data = { ...this.data, [key]: value }`) in `Widget.modifyData()`, forcing MobX to detect reference changes and trigger downstream updates.

### 2. Pluggable Component System with Dynamic Loading

Components are categorized into three tiers with a unified registration mechanism:

| Tier | Source | Loading | Example |
|------|--------|---------|---------|
| **Built-in** | Bundled in client code | Immediate (imported at build time) | Image, RichText, NormalText, Container |
| **Internal** | `PageData.innerWidgets` | Runtime dynamic loading from CDN | Business-specific widgets |
| **External** | `PageData.installed` | Runtime dynamic loading from CDN | Third-party widgets via x-cli scaffold |

All components converge into a single `WidgetConfigs` observable array that serves as the central component registry. External components are loaded at runtime via `loadScript` / `loadStyle`, fetching JS/CSS from CDN (`${STATIC_URL}/components/${type}/${version}/index.js`), and self-register into `god.__components__`.

**Component definition schema:**

```javascript
{
  name: 'Image',                    // Display name
  type: 'Image',                    // Unique identifier
  data: { url: '', viewBigPic: false },  // Default instance data
  config: {                         // Right-panel form schema (declarative)
    url: { text: 'Image URL', type: 'FilePicker', useData: true },
    viewBigPic: { text: 'View Full', type: 'Radio', options: [...] }
  },
  methods: { ... },                 // Reusable methods bound to widget instance
  onRender(ctx) { ... },            // Shared render function (editor + C-side)
  onEnter(ctx) { ... },             // First-add hook
  onNext(ctx) { ... },              // Enter-container hook
}
```

### 3. SSR Publishing with Graceful Degradation

The publish pipeline generates static HTML with server-rendered content for instant page load:

1. **Environment simulation** — `jsdom` creates a browser-like `document`/`navigator`/`localStorage` in Node.js
2. **External component execution** — Fetches component JS from CDN, executes via `new Function()` to register into `god.__components__`; only components with valid `xcli` version metadata are executed server-side
3. **React SSR** — `require`s the client-side `App` component and calls `renderToString(<App />)` to produce HTML
4. **Template assembly** — Handlebars embeds `mainHTML` (SSR output) and `PageData` (JSON) into the final HTML
5. **CDN deployment** — Uploads HTML and JSON to CDN; triggers screenshot for thumbnail
6. **Client hydration** — Browser loads the page, `ReactDOM.hydrate` attaches event listeners to existing DOM without re-creating nodes

**Graceful degradation:** If any step fails (component JS download error, browser API called during SSR, etc.), `needHydrate` is set to `false`, and the client falls back to `ReactDOM.render` — ensuring publishing never breaks due to SSR failures.

**`require.cache` isolation:** Each publish clears `require.cache` for the App module to prevent stale component code from previous publishes bleeding into the current render.

### 4. WYSIWYG Consistency (Editor ↔ C-Side)

The editor canvas and the published C-side page achieve visual consistency through five strategies:

| Strategy | Mechanism |
|----------|-----------|
| **Shared base class** | Both `BaseWidget` (editor) and `Widget` (C-side) extend `WidgetClass`, sharing `getStyle()` and `getWidgetContent()` |
| **Shared render function** | Same `onRender(ctx)` produces identical DOM structure on both sides |
| **Shared stylesheets** | Single `.less` file per component, used by both editor and C-side |
| **Shared layout logic** | Both sides split widgets into `flow` (document flow) and `normal` (absolute positioning) groups |
| **px2rem adaptation** | Editor uses 375px fixed canvas; C-side converts all px values to rem (1rem = 37.5px) for responsive scaling |

The only differences are interaction-layer wrappers: the editor adds `Rnd` (drag/resize) and `SortableList` (drag-sort), while the C-side adds touch events and `LazyLoad`.

### 5. Stage Abstraction for Unified Container Operations

The `Stage` class provides a polymorphic interface over four container types (Project, Page, Layer, Widget), eliminating repetitive conditional logic:

```javascript
class Stage {
  constructor(component, type) {
    this.component = component
    this.type = type
    // Dynamically bind to the correct child array
    this.list = component.pages || component.widgets || component.layers || []
  }
  addChild() { ... }        // Works on any container type
  removeChildren() { ... }  // No if-else for container type
  selectChildren() { ... }  // Unified selection across all levels
  sortChildren() { ... }    // Unified ordering
}
```

## Canvas Architecture

The editor canvas is not a simple `div` container. It is a multi-layered system:

```
WorkSpace
├── Selector                    — Marquee selection (drag to multi-select)
├── CanvasRuler (horizontal)    — Pixel ruler with alignment guides
├── CanvasRuler (vertical)      — Pixel ruler with alignment guides
└── Viewport
    └── SwipeableViews          — Multi-level navigation (page → container → layer)
        └── Stage               — Current editing surface
            ├── FlowSortableList
            │   └── BaseWidget × N   — Flow-layout widgets (sortable-hoc)
            └── BaseWidget × N       — Normal-layout widgets
                └── Rnd              — Drag/move + 8-direction resize
                    └── WidgetContent
                        └── onRender()
```

**Two layout modes coexist on the same canvas:**
- **Flow layout** (`react-sortable-hoc`): Widgets stack vertically in document flow, can be reordered by dragging
- **Normal layout** (`react-rnd`): Widgets are absolutely positioned, freely draggable and resizable with 5px grid snapping

## Project Structure

```
├── client/                          # Frontend application
│   ├── widgets/                     # Component library
│   │   ├── index.js                 # Component registry (WidgetConfigs), dynamic loader
│   │   ├── WidgetClass.js           # Shared base class for editor + C-side widgets
│   │   ├── WidgetContent.js         # Universal content renderer (data merge, lifecycle)
│   │   ├── Base/                    # Editor-side widget wrapper (Rnd + interactions)
│   │   ├── Widget/                  # C-side widget wrapper (touch events + px2rem)
│   │   ├── Image/                   # Built-in Image component
│   │   ├── RichText/                # Built-in Rich Text component
│   │   ├── NormalText/              # Built-in Text component
│   │   ├── Container/               # Built-in Container component
│   │   ├── DataContainer/           # Built-in Data Container (API-driven)
│   │   └── Layer/                   # Layer rendering component
│   ├── store/                       # MobX state management
│   │   ├── stage/
│   │   │   ├── StageStore.js        # Global editor state (project, stages, activeTab)
│   │   │   └── Stage.js             # Unified container operations abstraction
│   │   ├── clazz/
│   │   │   ├── Project.js           # @observable project model
│   │   │   ├── Page.js              # @observable page model
│   │   │   ├── Widget.js            # @observable widget model
│   │   │   ├── Layer.js             # @observable layer model
│   │   │   ├── Trigger.js           # @observable trigger model
│   │   │   ├── Animation.js         # @observable animation model
│   │   │   ├── Share.js             # @observable share config model
│   │   │   └── Base.js              # Base class with animation/trigger methods
│   │   └── history/                 # Undo/redo history management
│   ├── components/                  # Editor UI components
│   │   ├── HEWorkSpace/             # Canvas workspace (rulers, viewport, selector)
│   │   ├── HEStage/                 # Canvas stage (renders flow + normal widgets)
│   │   ├── HESettingsPanel/         # Right panel router (detects selected element type)
│   │   ├── HEAttributePanel/        # Attribute configuration tab
│   │   ├── HEEditorLeftWidgetPanel/ # Left panel component library
│   │   ├── HELayerList/             # Layer management panel
│   │   ├── HEAnimation/             # Animation wrapper component
│   │   └── ...                      # 80+ editor UI components
│   ├── controls/
│   │   └── ControlWrap/             # Dynamic form renderer (schema → UI controls)
│   ├── common/
│   │   ├── Container.js             # Shared page/layer container (flow + normal layout)
│   │   ├── god.js                   # Global namespace (window abstraction)
│   │   └── utils.js                 # Shared utilities
│   ├── triggers/                    # Behavior trigger implementations
│   │   ├── Redirect.js              # Page navigation
│   │   ├── ScrollToPage.js          # Scroll to page
│   │   ├── ChangeWidget.js          # Widget state modification
│   │   ├── EmitListeners.js         # Custom event emission
│   │   └── ...
│   ├── page/
│   │   ├── editor/                  # Editor page entry
│   │   └── project/preview/         # C-side page entry
│   │       ├── main.js              # Entry point (hydrate vs render decision)
│   │       ├── App.js               # Root app component
│   │       ├── Project.js           # Project renderer (multi-page routing)
│   │       ├── Page.js              # Page renderer (extends Container)
│   │       └── Widget.js            # C-side widget renderer
│   ├── utils/
│   │   └── ModelUtils.js            # px2rem, useDataValue, style utilities
│   └── apis/                        # API service layer
│
├── server/                          # Backend application (Koa)
│   ├── app.js                       # Server entry point
│   ├── controller/
│   │   ├── project/
│   │   │   └── helper/index.js      # SSR publish pipeline (jsdom + renderToString)
│   │   ├── widget/                  # Component CRUD APIs
│   │   ├── editor/                  # Editor data APIs
│   │   └── ...
│   ├── plugins/
│   │   └── render.js                # Handlebars template rendering (SSR assembly)
│   ├── utils/
│   │   ├── script.js                # Component JS fetching, SSR compatibility check
│   │   ├── urls.js                  # CDN URL construction
│   │   └── uploader.js              # CDN file upload
│   └── config/                      # Environment configurations
│
├── build/                           # Webpack configurations
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   ├── webpack.prod.js
│   └── webpack.server.js
│
├── docker-compose.yml               # Docker services (app + MongoDB + Redis)
├── Dockerfile
└── package.json
```

## Getting Started

### Prerequisites

| Software | Version |
|----------|---------|
| Node.js  | LTS     |
| MongoDB  | 3.4+    |
| Redis    | 4.0+    |

### Installation

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install
```

### Development

```bash
# Run both client and server concurrently
npm run dev:all

# Or run separately:
npm run dev-client     # Frontend dev server (port 8066)
npm run dev-server     # Backend server

# Debug mode
npm run debug
```

### Building

```bash
npm run build          # Production build
npm run build:prod     # Production environment
npm run build:gray     # Staging environment
npm run build:test     # Test environment
```

### Docker

```bash
docker-compose up -d
docker-compose logs -f
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start client and server concurrently |
| `npm run dev-client` | Start frontend dev server |
| `npm run dev-server` | Start backend server |
| `npm run build` | Production build |
| `npm run build:prod` | Build for production |
| `npm run build:gray` | Build for staging |
| `npm run build:test` | Build for test |
| `npm run lint` | Run ESLint and Prettier |
| `npm run debug` | Start server with debugging |
