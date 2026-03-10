# [H5](//h5.example.com)

    动态页面的可视化配置平台

## 环境依赖

    nodejs ^v8.11
    mongodb v3.4.2
    redis ^4.0.9

## 组件库依赖

    [ant.design](https://ant.design)

## Installation

首先将本项目仓库复制到本地进行开发:

```
git clone git@git.100tal.com:wangxiao_xesbiz_fe/x-core.git
```

接着安装依赖套件。

### 安装 NVM

NVM 全名是 Node Version Manager，专门在本机管理多个 NVM 版本。大致的原理为在`~/.nvm/`中安装不同的 Node 版本，使用者可以在其中任意切换。

1.  运行，此部将 nvm 安装至本机。

    ```bash
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    ```

2.  在 `~/.bash_profile`, `~/.profile` 或 `~/.bashrc`中加入

    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    ```

3.  安装 Node ^v8.11.1 版本 (视情况，可能需要重启 command line 以让 bash 生效)

    ```bash
    # 目前的稳定版
    nvm install 8.11.1
    ```

4.  运行 `nvm use 8.11.1`, 切换至 8.11.1 版本

### 安装 Mongodb

_homebrew 由于开源协议问题下架了 mongodb，具体安装流程参照 doc/deploy.md 中的 mongo 安装_

1.  透过 `brew` 安装 `mongodb`

    ```bash
    brew update
    brew install mongodb@3.4
    ```

2.  如果安装过程中遇到 brew 没有权限的问题，请执行以下代码使 brew 拥有权限:

    ```bash
    sudo chown -R $(whoami):admin /usr/local
    ```

3.  Mongodb 预设会在 `/data/db` 进行读写，因此需执行以下动作:

    ```bash
    sudo mkdir -p /data/db

    #取得读写权限
    sudo chmod -R go+w /data/db
    ```

> ⚠️ 注意： 执行完后，记得重启 Terminal

4.  更改 brew services 启动参数。因为 brew 是以服务的形式来启动 mongo ，需要更改 `.plist`:

    ```#bash
    vim ~/usr/local/Cellar/mongodb@3.4/3.4.14/homebrew.mxcl.mongodb@3.4.plist
    ```

    在第 11 行加入以下代码:

    ```XML
    <array>
        <string>/usr/local/opt/mongodb@3.4/bin/mongod</string>
        <string>--config</string>
        <string>cd mongod.conf</string>

        <!-- INSERT START -->
        <string>--port</string>
        <string>27027</string>
        <!-- INSERT END -->

    </array>
    ```

5.  运行 `brew services start mongodb@3.4` 运行 mongodb
6.  倒入 mongodb 数据（可以找本项目负责人要数据库备份文件），否则无法登录

### 安装其他依赖套件

    #安装基础 node_modules
    cd x-core
    npm i

    #安装服务端 node_modules
    cd x-core/server
    npm i

### 启动项目

    分为 client 和 server

    npm run dev-client
    npm run dev-server

### 修改 hosts(必须)

    vi /etc/hosts

    加入以下配置:
    127.0.0.1 h5.example.com

### 如何访问

- h5.example.com:8066

### 如何调试服务端

- 运行命令

  ```bash
  npm run debug
  ```

- 监听代码运行，将如下地址贴到 chrome 地址栏
  chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/af208870-675e-410c-948a-4da9b3d35e97

- 加好服务端断点 debugger，就可以调试了

```javascript
const initialize = function (env) {
  debugger
  console.log('1235678910')
}
```

### 安装 Redis

由于网络限制，我们采取 homebrew 安装 redis

1.  通过 `brew` 安装 `redis`

    ```bash
    brew install redis

    #安装成功提示信息：
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
    Or, if you don’t want/need launchctl, you can just run:
    redis-server /usr/local/etc/redis.conf
    ```

2.  启动 redis

    ```bash
    #使用launchctl启动
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist

    #使用配置文件启动
    redis-server /usr/local/etc/redis.conf
    ```

3.  开机自动启动 redis server

    ```bash
    ln -sfv /usr/local/opt/redis/*.plist ~/Library/LaunchAgents
    ```

4.  关闭自动启动 redis server

    ```bash
    launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
    ```

### 使用 docker 安装

```bash
docker-compose up -d
```

恢复备份数据库
将数据库拷贝到 volumes/mongo/backup
在 docker 中执行

```bash
mongorestore --db ares --host=127.0.0.1 --port=27017 --dir=/backup
```

## 可能遇到的问题

- mongo 数据库 auth 连接失败
  解决方案：删除并重新创建/data/db/，按照 deploy.MD 中的步骤重新创建 mongo 用户
- 发布系统报错 /usr/bin/dev node : not found
  解决方案：参照 deploy.MD 中的 salt 远程 shell 指令的软连接配置

# 梁仔的代码阅读记录

PageData 下字段的说明。

### UI 组件

主要目录在 widgets
widgets/index.js

-

### 行为组件

主要目录在 triggers
