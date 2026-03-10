# Enterprise Low-Code Campaign Platform

A visual configuration platform for building dynamic H5 campaign pages. Enables non-technical users to create and manage interactive mobile web pages through an intuitive drag-and-drop editor.

## Tech Stack

- **Frontend**: React, MobX, Ant Design
- **Backend**: Koa
- **Database**: MongoDB, Redis
- **Build Tools**: Webpack, Babel

## Features

- **Visual Editor**: Drag-and-drop interface for building H5 pages
- **Component Library**: Rich set of pre-built UI components and widgets
- **Behavior Triggers**: Configure interactive behaviors without coding
- **Template System**: Reusable page templates and components
- **Theme Management**: Customizable themes and styling
- **Role-based Access**: Multi-user collaboration with permission controls

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Redis

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Install server dependencies
cd server && npm install
```

### Development

Start both client and server in development mode:

```bash
# Run client and server concurrently
npm run dev:all

# Or run them separately:
npm run dev-client  # Start frontend dev server
npm run dev-server  # Start backend server
```

### Build

```bash
# Build for production
npm run build

# Build for specific environment
npm run build:prod
npm run build:gray
npm run build:test
```

## Project Structure

```
├── client/                 # Frontend application
│   ├── apis/              # API definitions
│   ├── base/              # Core data models
│   ├── common/            # Shared utilities
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── stores/            # MobX stores
│   └── styles/            # Global styles
├── server/                # Backend application
│   ├── controllers/       # Request handlers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── build/                 # Build configuration
└── volumes/               # Docker volumes
```

## License

ISC
