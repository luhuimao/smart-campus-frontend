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

## 阶段二：网页授权（免登录）

用户在企业微信内打开应用时，通过 OAuth2 获取用户身份。

### 流程

```
① 前端跳转授权地址
   https://open.weixin.qq.com/connect/oauth2/authorize
   ?appid={CorpId}
   &redirect_uri={回调URL，需 encodeURIComponent}
   &response_type=code
   &scope=snsapi_base
   &agentid={AgentId}
   #wechat_redirect

② 企业微信回调，URL 携带 code 参数

③ 前端将 code 传给后端 /api/auth/wecom

④ 后端用 code 换取用户身份
   GET https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo
       ?access_token={access_token}&code={code}
   → 返回 UserId
```

### Next.js 路由示例

```ts
// src/app/api/auth/wecom/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  // 1. 获取 access_token
  const tokenRes = await fetch(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken` +
    `?corpid=${process.env.WECOM_CORP_ID}` +
    `&corpsecret=${process.env.WECOM_SECRET}`
  );
  const { access_token } = await tokenRes.json();

  // 2. 用 code 换 UserId
  const userRes = await fetch(
    `https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo` +
    `?access_token=${access_token}&code=${code}`
  );
  const { UserId } = await userRes.json();

  // 3. 根据 UserId 查询系统用户，生成 session/token
  // ...
}
```

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
