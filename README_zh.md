# 企业级低代码营销活动平台

一个强大的可视化配置平台，用于构建动态 H5 营销页面。该企业级低代码平台使营销团队和非技术人员能够通过直观的拖拽编辑器创建和管理交互式移动网页，无需任何编程知识。

## 概述

> 用于构建动态 H5 营销页面的综合可视化配置平台

### 核心能力

| 功能 | 描述 |
|---------|-------------|
| **可视化页面构建** | 直观拖拽编辑器设计 H5 页面 |
| **组件管理** | 丰富的预置 UI 组件和部件库 |
| **行为配置** | 无需编码配置交互行为和动画 |
| **模板系统** | 创建和管理可复用的页面模板和组件 |
| **主题定制** | 灵活的主题系统，支持自定义样式 |
| **多用户协作** | 基于角色的访问控制，支持团队工作流 |
| **发布管理** | 版本控制和发布工作流，支持审计追踪 |

## 技术栈

| 类别 | 技术 |
|----------|--------------|
| **前端** | React, MobX, Ant Design |
| **后端** | Koa |
| **数据库** | MongoDB, Redis |
| **构建工具** | Webpack, Babel |
| **代码质量** | ESLint, Prettier, Husky |

---

## 功能特性

### 可视化编辑器 :art:

| 能力 | 详情 |
|-----------|---------|
| 画布 | 拖拽式画布用于页面布局 |
| 预览 | H5 页面实时预览 |
| 图层 | 多图层组件管理 |
| 历史 | 撤销/重做支持 |
| 快捷键 | 键盘快捷键支持 |

### 组件库 :package:

| 类别 | 组件 |
|----------|------------|
| **基础组件** | 文本、图片、富文本、容器 |
| **表单组件** | 输入框、下拉选择、按钮、卡片 |
| **媒体组件** | 视频、音频、轮播 |
| **布局组件** | 栅格、弹性盒、图层 |
| **数据展示** | 列表、表格、图表 |

### 行为触发器 :zap:

| 类型 | 能力 |
|------|--------------|
| **导航** | 页面跳转、滚动到锚点、深度链接 |
| **用户交互** | 点击、长按、滑动手势 |
| **数据操作** | 表单提交、API 调用、状态变更 |
| **动画** | 入场动画、过渡效果 |
| **条件逻辑** | 基于条件显示/隐藏 |

### 系统管理 :gear:

| 模块 | 功能 |
|---------|----------|
| **项目管理** | 创建、编辑、复制、删除项目 |
| **模板管理** | 保存和复用页面模板 |
| **主题管理** | 自定义主题和全局样式 |
| **用户与角色管理** | 权限控制系统 |
| **资源管理** | 图片、视频、文件上传和管理 |

## 快速开始

### 前置要求

| 软件 | 版本 |
|----------|---------|
| Node.js | LTS |
| MongoDB | 3.4+ |
| Redis | 4.0+ |

### 安装

```bash
# 克隆仓库
git clone <repository-url>

# 安装根目录依赖
npm install

# 安装服务端依赖
cd server
npm install
```

### 配置

#### 环境变量

在 `server` 目录下创建环境配置文件：

- `dev.env` - 开发环境
- `test.env` - 测试环境
- `gray.env` - 灰度/预发布环境
- `prod.env` - 生产环境

#### 数据库设置

平台使用 MongoDB 进行数据持久化，请在环境文件中配置连接信息。

### 开发

```bash
# 同时启动客户端和服务端
npm run dev:all

# 或者分别启动：
npm run dev-client     # 启动前端开发服务器（端口 8066）
npm run dev-server     # 启动后端开发服务器

# 调试模式
npm run debug          # 启用调试模式启动服务器
```

### 构建

```bash
# 生产环境构建
npm run build

# 针对特定环境构建
npm run build:prod     # 生产环境构建
npm run build:gray     # 灰度/预发布构建
npm run build:test     # 测试环境构建
```

### 使用 Docker 运行

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 项目结构

```
├── client/                     # 前端应用
│   ├── apis/                  # API 服务层
│   │   ├── BaseAPI.js         # 基础 API 配置
│   │   ├── DataAPI.js         # 数据管理 API
│   │   ├── ProjectAPI.js      # 项目 CRUD API
│   │   ├── UserAPI.js         # 用户管理 API
│   │   ├── WidgetAPI.js       # 组件管理 API
│   │   └── ...
│   ├── base/                   # 核心数据模型
│   │   ├── animation.js       # 动画定义
│   │   ├── layer.js           # 图层管理
│   │   ├── page.js            # 页面数据结构
│   │   ├── project.js         # 项目模型
│   │   ├── trigger.js         # 行为触发器
│   │   └── widget.js          # 组件定义
│   ├── common/                 # 共享工具
│   │   ├── component.js       # 组件辅助函数
│   │   ├── config.js          # 全局配置
│   │   ├── constants.js       # 常量定义
│   │   ├── request.js         # HTTP 请求工具
│   │   └── ...
│   ├── components/            # React 组件（编辑器 UI）
│   │   ├── HEAttributePanel/  # 属性面板
│   │   ├── HEComponentInfoPreview/
│   │   ├── HEDrawer/          # 抽屉组件
│   │   └── ...
│   ├── config/                # 前端配置
│   ├── containers/            # 容器组件
│   ├── context/               # React 上下文
│   ├── controls/              # 表单控件
│   ├── defaultData/           # 默认组件数据
│   ├── global/                # 全局组件
│   ├── hook/                  # 自定义 React Hooks
│   ├── layout/                # 布局组件
│   ├── page/                  # 页面组件
│   ├── static/                # 静态资源
│   ├── store/                 # MobX 状态管理
│   ├── triggers/              # 行为触发器组件
│   │   ├── AddShare.js
│   │   ├── ChangeWidget.js
│   │   ├── EmitListeners.js
│   │   ├── Redirect.js
│   │   ├── ScrollToPage.js
│   │   ├── Toast.js
│   │   └── ...
│   ├── utils/                 # 工具函数
│   └── widgets/                # UI 组件库
│       ├── Base/
│       ├── Container/
│       ├── Image/
│       ├── Layer/
│       ├── NormalText/
│       ├── RichText/
│       └── Widget/
├── server/                     # 后端应用
│   ├── app.js                 # 应用入口
│   ├── constants.js           # 服务端常量
│   ├── errors.js              # 错误定义
│   ├── loader.js              # 模块加载器
│   ├── common/                # 共享工具
│   ├── config/                # 服务端配置
│   ├── controller/            # 请求处理器
│   │   ├── dataController.js
│   │   ├── projectController.js
│   │   ├── userController.js
│   │   └── ...
│   ├── data/                  # 数据模型
│   ├── framework/             # 框架工具
│   ├── plugins/               # Koa 插件
│   ├── scripts/               # 工具脚本
│   └── utils/                 # 服务端工具
├── build/                      # 构建配置
│   ├── webpack.common.js      # 通用 webpack 配置
│   ├── webpack.dev.js         # 开发 webpack 配置
│   ├── webpack.prod.js        # 生产 webpack 配置
│   └── webpack.server.js      # 服务端 webpack 配置
├── volumes/                    # Docker 卷
│   ├── mongo/                # MongoDB 数据
│   └── redis/                # Redis 数据
├── docker-compose.yml         # Docker 编排配置
├── Dockerfile                 # Docker 镜像定义
└── package.json               # 项目依赖
```

## 可用脚本

| 命令 | 描述 |
|---------|-------------|
| `npm run dev:all` | 以开发模式启动客户端和服务端 |
| `npm run dev-client` | 启动前端开发服务器 |
| `npm run dev-server` | 启动后端开发服务器 |
| `npm run build` | 生产环境构建 |
| `npm run build:prod` | 生产环境构建 |
| `npm run build:gray` | 灰度/预发布环境构建 |
| `npm run build:test` | 测试环境构建 |
| `npm run lint` | 运行 ESLint 和 Prettier |
| `npm run debug` | 启用调试模式启动服务器 |

## API 文档

平台提供 RESTful API，包括：

- **项目**：H5 项目的 CRUD 操作
- **页面**：项目内页面管理
- **组件**：组件管理
- **模板**：模板 CRUD 操作
- **用户**：用户认证和管理
- **角色**：角色和权限管理
- **资源**：文件和媒体管理
- **数据**：数据持久化和检索

## 开发规范

### 代码风格

- 遵循 ESLint 配置的 JavaScript/JSX 规范
- 使用 Prettier 进行代码格式化
- 遵循 React 最佳实践和模式

### Git 工作流

- 新功能使用特性分支
- 提交信息应具有描述性
- 提交前钩子自动运行 linting
