# Life Recorder - 人生记录

一款以**人生日历**为核心的生活记录与规划应用。将你的一生可视化为网格，记录每一天的点滴、重要里程碑、未来目标和灵光一现的想法。

## 功能特性

- **人生日历** - 以周/月为单位的生命网格，颜色编码展示记录密度、重大事件和未来规划
- **日常记录** - 支持富文本编辑器、心情选择、标签分类和图片/视频附件
- **人生大事记** - 按时间线展示重要事件，8大分类 + 5星重要度评级
- **未来规划** - 四列看板视图（未开始/进行中/已完成/已放弃），支持优先级管理
- **想法灵感** - 瀑布流卡片布局，快速捕捉灵感
- **多用户认证** - JWT + httpOnly Cookie 认证，注册/登录/初始设置流程
- **文件上传** - 支持图片（jpg/png/gif/webp）和视频（mp4/webm）本地上传

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Nuxt 3 (Vue 3 + Nitro) |
| UI 组件 | Nuxt UI v2 + Tailwind CSS |
| 数据库 | SQLite (better-sqlite3 + Drizzle ORM) |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 富文本编辑器 | TipTap (vue-3 + starter-kit + image/link/placeholder) |
| 状态管理 | Pinia |
| 日期处理 | Day.js |
| 工具库 | VueUse |

## 项目结构

```
life-recorder/
├── assets/css/main.css          # 全局样式
├── components/
│   ├── calendar/LifeCalendar.vue # 人生日历核心组件
│   └── shared/                   # 共享组件
│       ├── RichTextEditor.vue    # TipTap 富文本编辑器
│       ├── MediaUploader.vue     # 文件上传组件
│       ├── MoodPicker.vue        # 心情选择器
│       └── TagInput.vue          # 标签输入组件
├── composables/
│   ├── useAuth.ts                # 认证状态管理
│   ├── useApi.ts                 # API 请求封装
│   └── useLifeCalendar.ts        # 日历网格计算
├── layouts/
│   ├── auth.vue                  # 认证页布局（登录/注册）
│   └── default.vue               # 主应用布局（侧边栏+内容区）
├── middleware/
│   └── auth.global.ts            # 全局路由守卫
├── pages/                        # 页面路由
│   ├── login.vue / register.vue / setup.vue
│   ├── dashboard.vue / calendar.vue / settings.vue
│   ├── records/index.vue
│   ├── milestones/index.vue
│   ├── plans/index.vue
│   └── ideas/index.vue
├── server/
│   ├── database/
│   │   ├── schema.ts             # Drizzle ORM 表结构定义（10张表）
│   │   └── index.ts              # 数据库连接与自动建表
│   ├── middleware/auth.ts        # API 认证中间件
│   ├── utils/
│   │   ├── auth.ts               # JWT 签发/验证 + 密码哈希
│   │   └── upload.ts             # 文件校验与路径生成
│   └── api/                      # RESTful API 端点
│       ├── auth/                 # 注册/登录/获取用户/退出
│       ├── records/              # 日常记录 CRUD
│       ├── milestones/           # 大事记 CRUD
│       ├── plans/                # 未来规划 CRUD
│       ├── ideas/                # 想法灵感 CRUD
│       ├── tags/                 # 标签管理
│       ├── calendar/summary.get  # 日历汇总数据
│       ├── profile/              # 个人信息更新
│       └── upload/               # 文件上传
├── data/                         # SQLite 数据库文件（自动创建）
├── uploads/                      # 用户上传文件（自动创建）
├── nuxt.config.ts
├── .env
└── package.json
```

## 本地开发

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 安装与启动

```bash
# 克隆项目
git clone <repo-url>
cd life-recorder

# 安装依赖
npm install

# 创建环境配置文件
cp .env.example .env
# 编辑 .env，修改 JWT_SECRET 为一个安全的随机字符串

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:3000`，注册账号即可开始使用。

## 服务器部署

### 方式一：Node.js 直接部署

适用于拥有自己的 VPS/云服务器（如阿里云 ECS、腾讯云 CVM、AWS EC2 等）。

#### 1. 服务器环境准备

```bash
# 安装 Node.js 18+ (以 Ubuntu/Debian 为例)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v   # >= 18.0.0
npm -v    # >= 9.0.0

# 安装构建工具（better-sqlite3 需要编译原生模块）
sudo apt-get install -y build-essential python3
```

#### 2. 上传项目代码

```bash
# 方式 A：通过 Git
cd /opt
git clone <repo-url> life-recorder
cd life-recorder

# 方式 B：通过 scp 上传（先在本地排除 node_modules）
# 本地执行：
scp -r ./life-recorder user@your-server:/opt/life-recorder
```

#### 3. 配置环境变量

```bash
cd /opt/life-recorder

# 创建生产环境配置
cat > .env << 'EOF'
# 必须修改：使用一个随机生成的强密钥（至少32位字符）
JWT_SECRET=your-production-secret-key-at-least-32-chars

# 数据库文件路径（确保目录可写）
DB_PATH=./data/life-recorder.db

# 用户上传文件存储路径（确保目录可写）
UPLOAD_DIR=./uploads

# 可选：指定运行端口
NITRO_PORT=3000

# 可选：指定监听地址（0.0.0.0 允许外部访问）
NITRO_HOST=0.0.0.0
EOF
```

> **安全提示**：生产环境中 `JWT_SECRET` 必须替换为一个足够长的随机字符串。可通过 `openssl rand -base64 48` 生成。

#### 4. 安装依赖并构建

```bash
# 安装生产依赖
npm install

# 构建生产版本
npm run build
```

构建完成后会在 `.output/` 目录生成可部署的产物。

#### 5. 创建数据目录

```bash
# 创建数据库和上传文件目录
mkdir -p data uploads

# 如果使用非 root 用户运行，确保目录权限
chown -R www-data:www-data data uploads
```

#### 6. 启动应用

```bash
# 直接启动（前台运行，测试用）
node .output/server/index.mjs

# 应用将监听在 NITRO_PORT 指定的端口（默认 3000）
```

#### 7. 使用 PM2 守护进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start .output/server/index.mjs --name life-recorder

# 设置开机自启
pm2 startup
pm2 save

# 常用管理命令
pm2 status              # 查看运行状态
pm2 logs life-recorder  # 查看日志
pm2 restart life-recorder  # 重启
pm2 stop life-recorder     # 停止
```

#### 8. 配置 Nginx 反向代理（推荐）

```bash
sudo apt-get install -y nginx
```

创建 Nginx 配置文件：

```bash
sudo cat > /etc/nginx/sites-available/life-recorder << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP

    # 文件上传大小限制（与应用限制一致：视频 100MB）
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态上传文件直接由 Nginx 提供（可选，提升性能）
    location /uploads/ {
        alias /opt/life-recorder/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/life-recorder /etc/nginx/sites-enabled/
sudo nginx -t        # 测试配置
sudo systemctl reload nginx
```

#### 9. 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书（替换域名）
sudo certbot --nginx -d your-domain.com

# 自动续期已默认启用，可手动验证
sudo certbot renew --dry-run
```

---

### 方式二：使用 systemd 管理（替代 PM2）

如果不想使用 PM2，可以用 systemd 管理进程：

```bash
sudo cat > /etc/systemd/system/life-recorder.service << 'EOF'
[Unit]
Description=Life Recorder Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/life-recorder
ExecStart=/usr/bin/node /opt/life-recorder/.output/server/index.mjs
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/life-recorder/.env

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable life-recorder   # 开机自启
sudo systemctl start life-recorder    # 启动
sudo systemctl status life-recorder   # 查看状态
sudo journalctl -u life-recorder -f   # 查看日志
```

---

### 方式三：Docker 部署

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder

# 安装 better-sqlite3 编译依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json

RUN mkdir -p data uploads

EXPOSE 3000

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

CMD ["node", ".output/server/index.mjs"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data        # 持久化数据库
      - ./uploads:/app/uploads  # 持久化上传文件
    environment:
      - JWT_SECRET=your-production-secret-key-at-least-32-chars
      - DB_PATH=./data/life-recorder.db
      - UPLOAD_DIR=./uploads
      - NITRO_HOST=0.0.0.0
      - NITRO_PORT=3000
    restart: unless-stopped
```

#### 3. 构建并启动

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

---

## 环境变量说明

| 变量 | 必须 | 默认值 | 说明 |
|------|------|--------|------|
| `JWT_SECRET` | 是 | `dev-secret-change-in-production` | JWT 签名密钥，生产环境必须修改 |
| `DB_PATH` | 否 | `./data/life-recorder.db` | SQLite 数据库文件路径 |
| `UPLOAD_DIR` | 否 | `./uploads` | 文件上传存储目录 |
| `NITRO_PORT` | 否 | `3000` | 服务监听端口 |
| `NITRO_HOST` | 否 | `localhost` | 服务监听地址，设为 `0.0.0.0` 允许外部访问 |

## 数据备份

应用的所有数据存储在两个位置，定期备份即可：

```bash
# 备份数据库
cp data/life-recorder.db backup/life-recorder-$(date +%Y%m%d).db

# 备份上传文件
tar czf backup/uploads-$(date +%Y%m%d).tar.gz uploads/
```

建议配置 cron 定时任务自动备份：

```bash
# 每天凌晨 3 点自动备份
0 3 * * * cp /home/mine/life-recorder/data/life-recorder.db /opt/backup/life-recorder-$(date +\%Y\%m\%d).db
0 3 * * * tar czf /opt/backup/uploads-$(date +\%Y\%m\%d).tar.gz -C /home/mine/life-recorder uploads/
```

## 更新部署

```bash
cd /opt/life-recorder

# 拉取最新代码
git pull

# 安装依赖（如有更新）
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart life-recorder
# 或
sudo systemctl restart life-recorder
```

## 常见问题

### better-sqlite3 编译失败

该模块包含 C++ 原生代码，需要编译环境：

```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential python3

# CentOS/RHEL
sudo yum groupinstall -y "Development Tools"
sudo yum install -y python3

# Alpine (Docker)
apk add --no-cache python3 make g++
```

### 端口被占用

修改 `.env` 中的 `NITRO_PORT` 为其他端口，或停止占用该端口的进程：

```bash
# 查看端口占用
lsof -i :3000
# 或
ss -tlnp | grep 3000
```

### 数据库文件权限问题

确保运行用户对 `data/` 和 `uploads/` 目录有读写权限：

```bash
chown -R <运行用户>:<运行用户组> data/ uploads/
chmod -R 755 data/ uploads/
```

## License

MIT
