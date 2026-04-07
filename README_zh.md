# 企业级低代码活动页搭建平台

一个企业级可视化低代码平台，用于搭建和发布交互式 H5 活动页面。核心特性包括：基于 MobX 响应式状态管理的三栏拖拽编辑器、支持运行时动态加载的可插拔组件体系，以及具备优雅降级机制的完整 SSR 发布流水线。

## 架构总览

```
┌─────────────────────── 编辑器 (React + MobX) ───────────────────────┐
│                                                                      │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  左侧面板    │    │   画布（中间）     │    │   右侧面板         │  │
│  │  组件库      │    │   Viewport       │    │   SettingsPanel    │  │
│  │  组件卡片    │◄──►│   ├ 瀑布流组件    │◄──►│   ├ AttributePanel │  │
│  │             │    │   │ (可拖拽排序)   │    │   ├ 样式控件       │  │
│  │             │    │   └ 自由定位组件   │    │   └ ControlWrap    │  │
│  │             │    │     (Rnd: 拖拽 +  │    │     (动态表单      │  │
│  │             │    │      缩放)        │    │      渲染器)       │  │
│  └──────┬──────┘    └────────┬─────────┘    └─────────┬──────────┘  │
│         │                    │                        │             │
│         └────────────────────┼────────────────────────┘             │
│                              │                                      │
│                   ┌──────────▼──────────┐                           │
│                   │   StageStore (MobX)  │                           │
│                   │   单一数据源:         │                           │
│                   │   Project → Pages    │                           │
│                   │   → Widgets          │                           │
│                   └─────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────┘
                               │
                            发布流程
                               │
                               ▼
┌─────────────────── 服务端 (Koa + Node.js) ───────────────────────────┐
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐  │
│  │ jsdom + React │──►│renderToString│──►│ Handlebars 模板           │  │
│  │ (模拟浏览器   │   │ (SSR HTML)   │   │ 嵌入 mainHTML + PageData │  │
│  │  环境)        │   └──────────────┘   └────────────┬─────────────┘  │
│  └──────────────┘                                    │               │
│                                             上传至 CDN               │
│                                                      │               │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────── C 端 H5 页面 ─────────────────────────────────────┐
│                                                                       │
│  SSR HTML（秒开）──► ReactDOM.hydrate ──► 可交互页面                  │
│                                                                       │
│  降级方案：SSR 失败 ──► ReactDOM.render ──► 客户端渲染                 │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **UI 框架** | React（Class Components） | 组件渲染和生命周期管理 |
| **状态管理** | MobX（`@observable` / `@observer`） | 编辑器三栏响应式数据绑定 |
| **编辑器交互** | react-rnd、react-sortable-hoc | 自由定位拖拽/缩放；瀑布流拖拽排序 |
| **UI 组件库** | Ant Design | 编辑器面板控件（Tabs、Modal、Input、Select 等） |
| **样式方案** | Less、px2rem | 组件样式 + 移动端 rem 自适应转换 |
| **服务端** | Koa | RESTful API 及 SSR 发布流水线 |
| **SSR** | ReactDOM.renderToString、jsdom | 服务端 HTML 生成 |
| **模板引擎** | Handlebars | 将 SSR 产物嵌入可发布的 HTML |
| **数据库** | MongoDB | 项目配置、组件元数据、用户数据存储 |
| **构建工具** | Webpack、Babel | 模块打包、ES6+/JSX 转译 |
| **代码质量** | ESLint、Prettier、Husky | 代码规范检查和提交前钩子 |
| **容器化** | Docker、docker-compose | 本地开发和部署 |

## 核心技术亮点

### 1. MobX 驱动的编辑器三栏实时通信

编辑器的左侧（组件库）、中间（画布）、右侧（属性面板）三个区域通过共享的 MobX 可观察数据模型进行通信，而非命令式的事件传递。

**可观察数据模型层级：**

```
StageStore (@observable)
├── project: Project
│   ├── pages: Page[]
│   │   ├── widgets: Widget[]      ← 每个组件拥有 @observable 的 data、isSelected 等属性
│   │   │   ├── layers: Layer[]
│   │   │   ├── triggers: Trigger[]
│   │   │   └── animations: Animation[]
│   │   └── variableStore           ← 页面级变量
│   ├── variableStore               ← 项目级变量
│   └── shareConfig: Share
├── stages: Stage[]                 ← 编辑上下文栈（project → page → layer）
└── activeTab: string               ← 右侧面板当前激活的标签页
```

**工作原理：** 三个面板都是 `@observer` 组件，从同一个 `StageStore` 实例读取数据。当右侧面板修改 `widget.data.url` 时，MobX 自动通知画布重新渲染——无需手动派发事件、无需逐层透传 props、无需 Redux 的 action 模板代码。

**解决的关键问题：** MobX 4 的 `observable({})` 不会追踪动态新增的属性。解决方案是在 `Widget.modifyData()` 中通过展开运算符重新赋值 `widget.data`（`this.data = { ...this.data, [key]: value }`），迫使 MobX 检测到引用变化并触发下游更新。

### 2. 可插拔组件体系与动态加载

组件分为三个层级，通过统一的注册机制管理：

| 层级 | 来源 | 加载方式 | 示例 |
|------|------|----------|------|
| **内建组件** | 打包在客户端代码中 | 构建时直接 import | Image、RichText、NormalText、Container |
| **内部组件** | `PageData.innerWidgets` | 运行时从 CDN 动态加载 | 业务定制组件 |
| **外部组件** | `PageData.installed` | 运行时从 CDN 动态加载 | 通过 x-cli 脚手架开发的第三方组件 |

所有组件最终汇聚到一个 `WidgetConfigs` 可观察数组中，作为中央组件注册表。外部组件通过 `loadScript` / `loadStyle` 在运行时加载，从 CDN 获取 JS/CSS（`${STATIC_URL}/components/${type}/${version}/index.js`），并自注册到 `god.__components__`。

**组件定义结构：**

```javascript
{
  name: '图片',                      // 显示名称
  type: 'Image',                    // 唯一标识符
  data: { url: '', viewBigPic: false },  // 默认实例数据
  config: {                         // 右侧面板表单配置（声明式）
    url: { text: '图片地址', type: 'FilePicker', useData: true },
    viewBigPic: { text: '查看大图', type: 'Radio', options: [...] }
  },
  methods: { ... },                 // 可复用方法，绑定到组件实例
  onRender(ctx) { ... },            // 共享渲染函数（编辑器 + C 端通用）
  onEnter(ctx) { ... },             // 首次添加钩子
  onNext(ctx) { ... },              // 进入容器钩子
}
```

### 3. SSR 发布与优雅降级

发布流水线生成带有服务端渲染内容的静态 HTML，实现页面秒开：

1. **环境模拟** — `jsdom` 在 Node.js 中创建类浏览器的 `document`/`navigator`/`localStorage` 环境
2. **外部组件执行** — 从 CDN 获取组件 JS，通过 `new Function()` 执行以注册到 `god.__components__`；仅具有有效 `xcli` 版本元数据的组件才会在服务端执行
3. **React SSR** — `require` 客户端的 `App` 组件，调用 `renderToString(<App />)` 生成 HTML
4. **模板组装** — Handlebars 将 `mainHTML`（SSR 产物）和 `PageData`（JSON）嵌入最终的 HTML 文件
5. **CDN 部署** — 将 HTML 和 JSON 上传到 CDN；触发自动截图生成缩略图
6. **客户端水合** — 浏览器加载页面后，`ReactDOM.hydrate` 在已有 DOM 上绑定事件监听器，无需重建节点

**优雅降级：** 如果任何步骤失败（组件 JS 下载异常、SSR 时调用了浏览器专属 API 等），`needHydrate` 将被设为 `false`，客户端降级为 `ReactDOM.render`——确保发布流程不会因 SSR 失败而中断。

**`require.cache` 隔离：** 每次发布都会清除 App 模块的 `require.cache`，防止上一次发布的旧组件代码污染当前渲染。

### 4. 所见即所得的一致性保障（编辑器 ↔ C 端）

编辑器画布与发布后的 C 端页面通过五层策略实现视觉一致性：

| 策略 | 机制 |
|------|------|
| **共享基类** | 编辑器 `BaseWidget` 和 C 端 `Widget` 均继承 `WidgetClass`，共享 `getStyle()` 和 `getWidgetContent()` |
| **共享渲染函数** | 同一个 `onRender(ctx)` 在两端生成相同的 DOM 结构 |
| **共享样式文件** | 每个组件只有一份 `.less` 文件，编辑器和 C 端共用 |
| **共享布局逻辑** | 两端均将组件分为 `flow`（文档流）和 `normal`（绝对定位）两组进行渲染 |
| **px2rem 适配** | 编辑器使用 375px 固定画布；C 端将所有 px 值转为 rem（1rem = 37.5px）实现响应式缩放 |

唯一的差异在于交互层包装：编辑器额外添加 `Rnd`（拖拽/缩放）和 `SortableList`（拖拽排序），C 端额外添加触摸事件和 `LazyLoad` 懒加载。

### 5. Stage 抽象层：统一容器操作

`Stage` 类为四种容器类型（Project、Page、Layer、Widget）提供了多态接口，消除了重复的条件判断逻辑：

```javascript
class Stage {
  constructor(component, type) {
    this.component = component
    this.type = type
    // 动态绑定到正确的子节点数组
    this.list = component.pages || component.widgets || component.layers || []
  }
  addChild() { ... }        // 适用于任何容器类型
  removeChildren() { ... }  // 无需针对容器类型做 if-else
  selectChildren() { ... }  // 跨层级统一选中
  sortChildren() { ... }    // 统一排序
}
```

## 画布架构

编辑器画布不是一个简单的 `div` 容器，而是一个多层系统：

```
WorkSpace
├── Selector                    — 框选工具（鼠标拖拽多选）
├── CanvasRuler（水平）          — 像素标尺 + 对齐辅助线
├── CanvasRuler（垂直）          — 像素标尺 + 对齐辅助线
└── Viewport
    └── SwipeableViews          — 多层级导航（页面 → 容器 → 图层）
        └── Stage               — 当前编辑画面
            ├── FlowSortableList
            │   └── BaseWidget × N   — 瀑布流布局组件（sortable-hoc）
            └── BaseWidget × N       — 自由定位组件
                └── Rnd              — 拖拽移动 + 八向缩放
                    └── WidgetContent
                        └── onRender()
```

**两种布局模式共存于同一画布：**
- **瀑布流布局**（`react-sortable-hoc`）：组件按文档流从上到下排列，可拖拽调整顺序
- **自由定位布局**（`react-rnd`）：组件通过绝对定位放置，可自由拖拽和八向缩放，拖动步长为 5px

## 项目结构

```
├── client/                          # 前端应用
│   ├── widgets/                     # 组件库
│   │   ├── index.js                 # 组件注册中心（WidgetConfigs）、动态加载器
│   │   ├── WidgetClass.js           # 编辑器 + C 端共享的组件基类
│   │   ├── WidgetContent.js         # 通用内容渲染器（数据合并、生命周期管理）
│   │   ├── Base/                    # 编辑器侧组件包装器（Rnd + 交互能力）
│   │   ├── Widget/                  # C 端组件包装器（触摸事件 + px2rem）
│   │   ├── Image/                   # 内建图片组件
│   │   ├── RichText/                # 内建富文本组件
│   │   ├── NormalText/              # 内建文本组件
│   │   ├── Container/               # 内建容器组件
│   │   ├── DataContainer/           # 内建数据容器（API 驱动）
│   │   └── Layer/                   # 图层渲染组件
│   ├── store/                       # MobX 状态管理
│   │   ├── stage/
│   │   │   ├── StageStore.js        # 全局编辑器状态（project、stages、activeTab）
│   │   │   └── Stage.js             # 统一容器操作抽象层
│   │   ├── clazz/
│   │   │   ├── Project.js           # @observable 项目数据模型
│   │   │   ├── Page.js              # @observable 页面数据模型
│   │   │   ├── Widget.js            # @observable 组件数据模型
│   │   │   ├── Layer.js             # @observable 图层数据模型
│   │   │   ├── Trigger.js           # @observable 触发器数据模型
│   │   │   ├── Animation.js         # @observable 动画数据模型
│   │   │   ├── Share.js             # @observable 分享配置模型
│   │   │   └── Base.js              # 基类（动画/触发器方法）
│   │   └── history/                 # 撤销/重做历史管理
│   ├── components/                  # 编辑器 UI 组件
│   │   ├── HEWorkSpace/             # 画布工作区（标尺、视口、框选器）
│   │   ├── HEStage/                 # 画布舞台（渲染 flow + normal 组件）
│   │   ├── HESettingsPanel/         # 右侧面板路由（检测选中元素类型）
│   │   ├── HEAttributePanel/        # 属性配置标签页
│   │   ├── HEEditorLeftWidgetPanel/ # 左侧组件库面板
│   │   ├── HELayerList/             # 图层管理面板
│   │   ├── HEAnimation/             # 动画包装组件
│   │   └── ...                      # 80+ 编辑器 UI 组件
│   ├── controls/
│   │   └── ControlWrap/             # 动态表单渲染器（配置 schema → UI 控件）
│   ├── common/
│   │   ├── Container.js             # 共享页面/图层容器（flow + normal 布局）
│   │   ├── god.js                   # 全局命名空间（window 抽象）
│   │   └── utils.js                 # 共享工具函数
│   ├── triggers/                    # 行为触发器实现
│   │   ├── Redirect.js              # 页面跳转
│   │   ├── ScrollToPage.js          # 滚动到指定页面
│   │   ├── ChangeWidget.js          # 组件状态修改
│   │   ├── EmitListeners.js         # 自定义事件发送
│   │   └── ...
│   ├── page/
│   │   ├── editor/                  # 编辑器页面入口
│   │   └── project/preview/         # C 端页面入口
│   │       ├── main.js              # 入口文件（hydrate vs render 决策）
│   │       ├── App.js               # 根组件
│   │       ├── Project.js           # 项目渲染器（多页面路由）
│   │       ├── Page.js              # 页面渲染器（继承 Container）
│   │       └── Widget.js            # C 端组件渲染器
│   ├── utils/
│   │   └── ModelUtils.js            # px2rem、useDataValue、样式工具
│   └── apis/                        # API 服务层
│
├── server/                          # 后端应用（Koa）
│   ├── app.js                       # 服务端入口
│   ├── controller/
│   │   ├── project/
│   │   │   └── helper/index.js      # SSR 发布流水线（jsdom + renderToString）
│   │   ├── widget/                  # 组件 CRUD API
│   │   ├── editor/                  # 编辑器数据 API
│   │   └── ...
│   ├── plugins/
│   │   └── render.js                # Handlebars 模板渲染（SSR 组装）
│   ├── utils/
│   │   ├── script.js                # 组件 JS 获取、SSR 兼容性检查
│   │   ├── urls.js                  # CDN URL 构建
│   │   └── uploader.js              # CDN 文件上传
│   └── config/                      # 环境配置
│
├── build/                           # Webpack 配置
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   ├── webpack.prod.js
│   └── webpack.server.js
│
├── docker-compose.yml               # Docker 服务（应用 + MongoDB + Redis）
├── Dockerfile
└── package.json
```

## 快速开始

### 环境要求

| 软件 | 版本 |
|------|------|
| Node.js | LTS |
| MongoDB | 3.4+ |
| Redis | 4.0+ |

### 安装

```bash
# 安装根目录依赖
npm install

# 安装服务端依赖
cd server && npm install
```

### 开发

```bash
# 同时启动前后端
npm run dev:all

# 或分别启动：
npm run dev-client     # 前端开发服务器（端口 8066）
npm run dev-server     # 后端服务器

# 调试模式
npm run debug
```

### 构建

```bash
npm run build          # 生产构建
npm run build:prod     # 生产环境
npm run build:gray     # 灰度环境
npm run build:test     # 测试环境
```

### Docker

```bash
docker-compose up -d
docker-compose logs -f
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev:all` | 同时启动前后端开发模式 |
| `npm run dev-client` | 启动前端开发服务器 |
| `npm run dev-server` | 启动后端开发服务器 |
| `npm run build` | 生产构建 |
| `npm run build:prod` | 构建生产环境 |
| `npm run build:gray` | 构建灰度环境 |
| `npm run build:test` | 构建测试环境 |
| `npm run lint` | 运行 ESLint 和 Prettier |
| `npm run debug` | 以调试模式启动服务器 |
