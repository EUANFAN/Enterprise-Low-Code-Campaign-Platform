# Enterprise Low-Code Campaign Platform

A powerful visual configuration platform for building dynamic H5 campaign pages. This enterprise-grade low-code platform enables marketing teams and non-technical users to create and manage interactive mobile web pages through an intuitive drag-and-drop editor, without requiring any programming knowledge.

## Overview

> A comprehensive visual configuration platform for building dynamic H5 campaign pages

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Visual Page Building** | Intuitive drag-and-drop editor for designing H5 pages |
| **Component Management** | Rich library of pre-built UI components and widgets |
| **Behavior Configuration** | Configure interactive behaviors and animations without coding |
| **Template System** | Create and manage reusable page templates and components |
| **Theme Customization** | Flexible theming system with customizable styles |
| **Multi-user Collaboration** | Role-based access control for team workflows |
| **Publish Management** | Version control and publish workflows with audit trails |

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React, MobX, Ant Design |
| **Backend** | Koa |
| **Database** | MongoDB, Redis |
| **Build Tools** | Webpack, Babel |
| **Code Quality** | ESLint, Prettier, Husky |

---

## Features

### Visual Editor :art:

| Capability | Details |
|-----------|---------|
| Canvas | Drag-and-drop canvas for page layout |
| Preview | Real-time preview of H5 pages |
| Layers | Multi-layer component management |
| History | Undo/redo support |
| Shortcuts | Keyboard shortcuts |

### Component Library :package:
- Drag-and-drop canvas for page layout
- Real-time preview of H5 pages
- Multi-layer component management
- Undo/redo support
- Keyboard shortcuts

### Component Library :package:

| Category | Components |
|----------|------------|
| **Basic Components** | Text, Image, Rich Text, Container |
| **Form Components** | Input, Select, Button, Card |
| **Media Components** | Video, Audio, Carousel |
| **Layout Components** | Grid, Flex, Layer |
| **Data Display** | List, Table, Chart |

### Behavior Triggers :zap:

| Type | Capabilities |
|------|--------------|
| **Navigation** | Page jump, scroll to anchor, deep linking |
| **User Interaction** | Click, Long press, Swipe gestures |
| **Data Actions** | Form submission, API calls, State changes |
| **Animations** | Entrance animations, Transition effects |
| **Conditional Logic** | Show/hide based on conditions |

### System Management :gear:

| Module | Features |
|--------|----------|
| **Project Management** | Create, edit, copy, delete projects |
| **Template Management** | Save and reuse page templates |
| **Theme Management** | Custom themes and global styles |
| **User & Role Management** | Permission control system |
| **Resource Management** | Image, video, file upload and management |

## Getting Started

### Prerequisites

| Software | Version |
|----------|---------|
| Node.js | LTS |
| MongoDB | 3.4+ |
| Redis | 4.0+ |

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
```

### Configuration

#### Environment Variables

Create environment configuration files in the `server` directory:

- `dev.env` - Development environment
- `test.env` - Test environment
- `gray.env` - Gray/Staging environment
- `prod.env` - Production environment

#### Database Setup

The platform uses MongoDB for data persistence. Configure the connection in your environment file.

### Development

```bash
# Run both client and server concurrently
npm run dev:all

# Or run them separately:
npm run dev-client     # Start frontend dev server (port 8066)
npm run dev-server     # Start backend server

# Debug mode
npm run debug          # Start server with debugging enabled
```

### Building

```bash
# Build for production
npm run build

# Build for specific environment
npm run build:prod     # Production build
npm run build:gray     # Gray/Staging build
npm run build:test     # Test build
```

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Project Structure

```
├── client/                     # Frontend application
│   ├── apis/                  # API service layers
│   │   ├── BaseAPI.js         # Base API configuration
│   │   ├── DataAPI.js         # Data management APIs
│   │   ├── ProjectAPI.js      # Project CRUD APIs
│   │   ├── UserAPI.js         # User management APIs
│   │   ├── WidgetAPI.js       # Widget management APIs
│   │   └── ...
│   ├── base/                   # Core data models
│   │   ├── animation.js       # Animation definitions
│   │   ├── layer.js           # Layer management
│   │   ├── page.js            # Page data structure
│   │   ├── project.js         # Project model
│   │   ├── trigger.js         # Behavior triggers
│   │   └── widget.js          # Widget definitions
│   ├── common/                 # Shared utilities
│   │   ├── component.js       # Component helpers
│   │   ├── config.js          # Global configuration
│   │   ├── constants.js       # Constants definitions
│   │   ├── request.js        # HTTP request utilities
│   │   └── ...
│   ├── components/            # React components (Editor UI)
│   │   ├── HEAttributePanel/  # Property panel
│   │   ├── HEComponentInfoPreview/
│   │   ├── HEDrawer/          # Drawer components
│   │   └── ...
│   ├── config/                # Frontend configuration
│   ├── containers/            # Container components
│   ├── context/               # React context
│   ├── controls/              # Form controls
│   ├── defaultData/           providers # Default component data
│   ├── global/                # Global components
│   ├── hook/                  # Custom React hooks
│   ├── layout/                # Layout components
│   ├── page/                  # Page components
│   ├── static/                # Static assets
│   ├── store/                 # MobX stores
│   ├── triggers/              # Behavior trigger components
│   │   ├── AddShare.js
│   │   ├── ChangeWidget.js
│   │   ├── EmitListeners.js
│   │   ├── Redirect.js
│   │   ├── ScrollToPage.js
│   │   ├── Toast.js
│   │   └── ...
│   ├── utils/                 # Utility functions
│   └── widgets/               # UI widget library
│       ├── Base/
│       ├── Container/
│       ├── Image/
│       ├── Layer/
│       ├── NormalText/
│       ├── RichText/
│       └── Widget/
├── server/                     # Backend application
│   ├── app.js                 # Application entry
│   ├── constants.js           # Server constants
│   ├── errors.js              # Error definitions
│   ├── loader.js              # Module loader
│   ├── common/                # Shared utilities
│   ├── config/                # Server configuration
│   ├── controller/            # Request handlers
│   │   ├── dataController.js
│   │   ├── projectController.js
│   │   ├── userController.js
│   │   └── ...
│   ├── data/                  # Data models
│   ├── framework/             # Framework utilities
│   ├── plugins/               # Koa plugins
│   ├── scripts/               # Utility scripts
│   └── utils/                 # Server utilities
├── build/                      # Build configuration
│   ├── webpack.common.js      # Common webpack config
│   ├── webpack.dev.js        # Dev webpack config
│   ├── webpack.prod.js       # Production webpack config
│   └── webpack.server.js     # Server webpack config
├── volumes/                    # Docker volumes
│   ├── mongo/                # MongoDB data
│   └── redis/                # Redis data
├── docker-compose.yml         # Docker composition
├── Dockerfile                 # Docker image definition
└── package.json               # Project dependencies
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start client and server in development mode |
| `npm run dev-client` | Start frontend development server |
| `npm run dev-server` | Start backend development server |
| `npm run build` | Build for production |
| `npm run build:prod` | Build for production environment |
| `npm run build:gray` | Build for gray/staging environment |
| `npm run build:test` | Build for test environment |
| `npm run lint` | Run ESLint and Prettier |
| `npm run debug` | Start server with debugging |

## API Documentation

The platform provides RESTful APIs for:

- **Projects**: CRUD operations for H5 projects
- **Pages**: Page management within projects
- **Widgets**: Component management
- **Templates**: Template CRUD operations
- **Users**: User authentication and management
- **Roles**: Role and permission management
- **Resources**: File and media management
- **Data**: Data persistence and retrieval

## Development Guidelines

### Code Style

- Follow ESLint configuration for JavaScript/JSX
- Use Prettier for code formatting
- Follow React best practices and patterns

### Git Workflow

- Feature branches for new features
- Commit messages should be descriptive
- Pre-commit hooks run linting automatically

### Component Development

1. Create component in appropriate directory
2. Define component metadata and properties
3. Register in widget/trigger system
4. Add to component palette

## License

ISC
