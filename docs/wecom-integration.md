# 企业微信自建应用接入指南

> 适用项目：智慧教学管理系统
> 文档日期：2026-05-18

---

## 前提条件

| 项目 | 要求 |
|------|------|
| 域名 | 必须 HTTPS，且已备案 |
| 回调域名 | 需在企业微信后台白名单中 |
| 服务端 | 需存储 `access_token`（有效期 2 小时，需定时刷新） |
| 用户映射 | 企业微信 `UserId` 需与系统账号关联 |

---

## 阶段一：企业微信后台配置

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/wework_admin)
2. 进入 **应用管理 → 自建 → 创建应用**
3. 填写应用名称、图标、可见范围（部门/成员）
4. 创建后获得以下凭证（保存到 `.env.local`）：

```env
WECOM_CORP_ID=       # 企业 ID，在"我的企业"页面
WECOM_AGENT_ID=      # 应用 ID
WECOM_SECRET=        # 应用密钥
```

---

## 阶段二：网页授权（免登录）✅ 已实现

用户在企业微信内打开应用时，通过 OAuth2 获取用户身份。

### 流程

```
① middleware 检测到未登录，重定向到 /api/auth/wecom?redirect={原始路径}

② /api/auth/wecom 构造企业微信 OAuth 授权 URL，302 跳转：
   https://open.weixin.qq.com/connect/oauth2/authorize
   ?appid={CorpId}&redirect_uri={callbackUrl}&response_type=code
   &scope=snsapi_base&agentid={AgentId}&state={redirect}
   #wechat_redirect

③ 企业微信回调 /api/auth/callback?code=xxx&state={原始路径}

④ 后端用 code 换取用户身份，写 HTTP-only Cookie，跳回原始路径
```

### 已实现文件

#### `src/lib/wecom-auth.ts` — 核心工具库

```ts
export type WecomUser = { userId: string; name: string; avatar?: string };

// Session Cookie 编解码（Base64url JSON，无需加密库）
export function encodeSession(user: WecomUser): string
export function decodeSession(value: string): WecomUser | null

// 本地开发绕过（读取 WECOM_DEV_USER_ID / WECOM_DEV_USER_NAME）
export function getDevUser(): WecomUser | null

// 企业微信 API
export async function getAccessToken(): Promise<string>
export async function getUserByCode(code: string): Promise<WecomUser>
export function buildOAuthUrl(redirectUri: string, state?: string): string

export const SESSION_COOKIE = "wecom_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 小时
```

#### `src/app/api/auth/wecom/route.ts` — OAuth 入口

```ts
// GET /api/auth/wecom?redirect=/some/path
export async function GET(req: NextRequest) {
  const redirect = searchParams.get("redirect") ?? "/";

  // 开发模式：直接写假 session，跳回目标页
  const devUser = getDevUser();
  if (devUser) {
    const res = NextResponse.redirect(new URL(redirect, origin));
    res.cookies.set(SESSION_COOKIE, encodeSession(devUser), { httpOnly: true, sameSite: "lax", maxAge: SESSION_MAX_AGE, path: "/" });
    return res;
  }

  // 生产：跳转企业微信授权页
  const callbackUrl = `${origin}/api/auth/callback`;
  return NextResponse.redirect(buildOAuthUrl(callbackUrl, redirect));
}
```

#### `src/app/api/auth/callback/route.ts` — OAuth 回调

```ts
// GET /api/auth/callback?code=xxx&state=/some/path
export async function GET(req: NextRequest) {
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "/";

  const user = await getUserByCode(code);          // code → UserId → 用户详情
  const res = NextResponse.redirect(new URL(state, origin));
  res.cookies.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true, sameSite: "lax", maxAge: SESSION_MAX_AGE, path: "/",
  });
  return res;
}
```

#### `src/app/api/auth/logout/route.ts` — 退出登录

```ts
// GET /api/auth/logout
export async function GET() {
  const res = NextResponse.redirect(new URL("/api/auth/wecom", origin));
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
```

#### `src/middleware.ts` — 路由守卫

```ts
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/favicon.ico"];

export function middleware(req: NextRequest) {
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (getDevUser()) return NextResponse.next();  // 开发模式放行

  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionCookie && decodeSession(sessionCookie)) return NextResponse.next();

  // 未登录 → 跳转授权
  const loginUrl = new URL("/api/auth/wecom", origin);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### `src/app/page.tsx` — Server Component 读取 session

```ts
export default async function Home() {
  let currentUser: WecomUser | null = getDevUser();
  if (!currentUser) {
    const jar = await cookies();
    const val = jar.get("wecom_session")?.value;
    if (val) currentUser = decodeSession(val);
  }
  return <HomeClient currentUser={currentUser} />;
}
```

#### `src/components/Sidebar.tsx` — 侧边栏底部用户信息

侧边栏底部展示当前用户头像首字、姓名，以及退出登录按钮（`/api/auth/logout`）。

### 本地开发绕过

`.env.local` 中设置以下变量即可跳过 OAuth，直接以模拟用户登录：

```env
WECOM_DEV_USER_ID=dev_user
WECOM_DEV_USER_NAME=开发者
```

两个变量同时存在时，middleware 直接放行，`/api/auth/wecom` 写入假 session。
**生产部署时删除这两个变量即可自动切换为真实 OAuth 流程。**

---

## 阶段三：JS-SDK 配置（可选）

用于调用原生能力：扫码、拍照、位置、分享等。

### 配置步骤

1. 企业微信后台 → 应用详情 → **网页授权及JS-SDK** → 绑定可信域名
2. 前端页面引入 SDK 并注入签名：

```ts
// 后端生成签名（/api/wecom/jssdk-config）
import * as crypto from "crypto";

function sign(jsapiTicket: string, url: string) {
  const nonceStr = Math.random().toString(36).slice(2);
  const timestamp = Math.floor(Date.now() / 1000);
  const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const signature = crypto.createHash("sha1").update(str).digest("hex");
  return { nonceStr, timestamp, signature };
}
```

```ts
// 前端调用
wx.config({
  beta: true,
  debug: false,
  appId: CORP_ID,
  timestamp,
  nonceStr,
  signature,
  jsApiList: ["scanQRCode", "getLocation"],
});
```

> `jsapi_ticket` 有效期 2 小时，需服务端缓存，避免频繁请求。

---

## 阶段四：应用主页配置

1. 企业微信后台 → 应用详情 → **应用主页**
2. 填入系统 URL（必须 HTTPS），例如：`https://your-domain.com`
3. 用户点击企业微信中的应用图标即打开该 URL
4. 企业微信会自动在 URL 中注入 `code` 参数，完成身份验证流程

---

## 最小可行接入路径

```
阶段一（后台配置）→ 阶段二（OAuth 免登录）→ 阶段四（配置主页 URL）
```

完成以上三步即可实现"打开应用自动识别用户身份"。阶段三（JS-SDK）按需叠加。

---

## 参考文档

- [企业微信开发文档](https://developer.work.weixin.qq.com/document/path/90664)
- [网页授权登录](https://developer.work.weixin.qq.com/document/path/91335)
- [JS-SDK 说明文档](https://developer.work.weixin.qq.com/document/path/90514)
