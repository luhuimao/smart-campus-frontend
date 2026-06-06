# 正式环境部署指南

> 适用项目：智慧教学管理系统
> 部署目标：Ubuntu 云服务器（22.04+）
> 文档日期：2026-06-06

---

## 前置条件

| 项目 | 要求 |
|------|------|
| Node.js | >= 24 |
| 域名 | `zhihui-hongde.com.cn` 已备案 |
| HTTPS | 企业微信要求回调域名必须 HTTPS |
| 企业微信 IP 白名单 | 服务器公网 IP 加入企业微信后台白名单 |

---

## 一、DNS 解析

在域名服务商控制台（腾讯云/阿里云/华为云），添加 DNS 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | `@` | `服务器公网 IP` | 600 |
| A | `www` | `服务器公网 IP` | 600 |

验证：
```bash
nslookup zhihui-hongde.com.cn
```

---

## 二、SSL 证书（共用）

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# 1. 先配置 HTTP-only Nginx（用于域名验证）
sudo tee /etc/nginx/sites-available/smart-campus << 'NGINX'
server {
    listen 80;
    server_name zhihui-hongde.com.cn www.zhihui-hongde.com.cn;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/smart-campus /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 2. certbot 自动获取证书并改写 Nginx 配置（添加 443 SSL + 301 跳转）
sudo certbot --nginx -d zhihui-hongde.com.cn -d www.zhihui-hongde.com.cn
```

证书获取后的 Nginx 配置由 certbot 自动管理。证书路径：
```
/etc/letsencrypt/live/zhihui-hongde.com.cn/fullchain.pem
/etc/letsencrypt/live/zhihui-hongde.com.cn/privkey.pem
```

证书有效期 90 天，certbot 自动续期无需手动操作。

---

## 三、部署方案

### 方案 A：Nginx + PM2（推荐）

轻量、简单，适合中小型项目。

#### 1. 安装依赖

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm i -g pm2
```

#### 2. 拉取代码 + 构建

```bash
# 首次：clone 项目
git clone https://github.com/luhuimao/smart-campus-frontend.git /var/www/smart-campus

# 更新代码：pull
cd /var/www/smart-campus
git pull
```

#### 3. 环境变量 + 启动

> 注意：Next.js standalone 运行时**不读取** `.env` 文件，需通过 PM2 ecosystem 文件传递。

```bash
cd /var/www/smart-campus

# 创建 PM2 ecosystem 配置（含全部环境变量）
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'smart-campus',
    cwd: '/var/www/smart-campus',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--require ./btoa-polyfill.cjs',
      WECOM_CORP_ID: 'wwda99e7342e5368b5',
      WECOM_AGENT_ID: '1000034',
      WECOM_SECRET: '你的应用密钥',
      NEXT_PUBLIC_BASE_URL: 'https://zhihui-hongde.com.cn',
      JIANDAOYUN_API_KEY: '你的简道云API密钥',
    }
  }]
};
EOF

# 构建
npm install
npm run build

# 确保静态文件复制到 standalone 目录（Next.js 构建有时遗漏）
cp -r .next/static .next/standalone/.next/

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx 反向代理

SSL 证书申请时（第二节）已配置 Nginx，certbot 会自动改写为 HTTPS 配置。如需手动修改：

```bash
sudo nano /etc/nginx/sites-available/smart-campus
sudo nginx -t && sudo systemctl reload nginx
```

---

### 方案 B：Docker Compose

容器化部署，环境隔离，项目已有 `Dockerfile` 和 `docker-compose.yml`。

#### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
# 重新登录使权限生效
```

#### 2. 拉取代码

```bash
# 首次：clone 项目
git clone https://github.com/luhuimao/smart-campus-frontend.git /var/www/smart-campus

# 更新代码：pull
cd /var/www/smart-campus
git pull
```

#### 3. 服务器配置

```bash
cd /var/www/smart-campus

# 创建 .env 文件
cat > .env << 'EOF'
WECOM_CORP_ID=wwda99e7342e5368b5
WECOM_AGENT_ID=1000034
WECOM_SECRET=你的应用密钥
NEXT_PUBLIC_BASE_URL=https://zhihui-hongde.com.cn
PORT=3000
EOF
```

#### 4. 启动

```bash
docker compose up -d --build
```

#### 5. Nginx 反向代理

同方案 A 第 6 步配置 Nginx，`proxy_pass` 指向 Docker 暴露的 3000 端口。

---

## 四、企业微信 IP 白名单

企业微信管理后台 → **我的企业 → 企业信息 → 安全与保密 → IP 白名单**

添加服务器的**公网出口 IP**：

```bash
# 在服务器上执行查看
curl -s ifconfig.me
```

---

## 五、运维命令

### 通用

```bash
# 查看服务器出口 IP
curl -s ifconfig.me

# SSL 证书续期
sudo certbot renew --dry-run   # 测试
sudo certbot renew              # 执行续期
```

### 方案 A（PM2）

```bash
pm2 status                 # 查看状态
pm2 logs smart-campus      # 查看日志
pm2 restart smart-campus   # 重启
pm2 stop smart-campus      # 停止

# 重新部署
cd /var/www/smart-campus
git pull
npm install
npm run build
cp -r .next/static .next/standalone/.next/
pm2 restart smart-campus

# 修改环境变量后重启
pm2 delete smart-campus
pm2 start ecosystem.config.js
pm2 save
```

### 方案 B（Docker）

```bash
cd /var/www/smart-campus

docker compose ps                  # 查看状态
docker compose logs -f app         # 查看日志
docker compose restart app         # 重启
docker compose down                # 停止

# 重新部署
cd /var/www/smart-campus
git pull
docker compose up -d --build app
```

### Nginx

```bash
sudo nginx -t                 # 测试配置
sudo systemctl reload nginx   # 重载
sudo systemctl restart nginx  # 重启
```

---

## 六、目录结构

```
/var/www/smart-campus/
├── ecosystem.config.js   # PM2 环境变量 + 启动配置（方案 A）
├── server.js             # Next.js standalone 入口（方案 A）
├── .next/
│   └── static/           # 构建静态资源
├── public/
│   └── WW_verify_*.txt   # 企业微信域名验证文件
├── .env                  # 环境变量（方案 B：docker compose 读取）
├── Dockerfile            # Docker 构建（方案 B）
├── docker-compose.yml    # Docker 编排（方案 B）
└── node_modules/         # 依赖（方案 A）
```
