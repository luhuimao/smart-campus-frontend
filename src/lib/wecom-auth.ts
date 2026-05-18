export type WecomUser = {
  userId: string;
  name: string;
  avatar?: string;
};

const SESSION_COOKIE = "wecom_session";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// ── Session encoding ──────────────────────────────────────────────

export function encodeSession(user: WecomUser): string {
  const json = JSON.stringify(user);
  return Buffer.from(json).toString("base64url");
}

export function decodeSession(value: string): WecomUser | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (typeof parsed.userId === "string" && typeof parsed.name === "string") {
      return parsed as WecomUser;
    }
    return null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE };

// ── Dev mode ──────────────────────────────────────────────────────

export function getDevUser(): WecomUser | null {
  const userId = process.env.WECOM_DEV_USER_ID;
  const name = process.env.WECOM_DEV_USER_NAME;
  if (userId && name) return { userId, name };
  return null;
}

// ── WeCom API ─────────────────────────────────────────────────────

const WECOM_API = "https://qyapi.weixin.qq.com/cgi-bin";

export async function getAccessToken(): Promise<string> {
  const corpId = process.env.WECOM_CORP_ID;
  const secret = process.env.WECOM_SECRET;
  if (!corpId || !secret) throw new Error("WECOM_CORP_ID or WECOM_SECRET not configured");

  const res = await fetch(
    `${WECOM_API}/gettoken?corpid=${corpId}&corpsecret=${secret}`
  );
  const data = await res.json();
  if (data.errcode !== 0) throw new Error(`gettoken failed: ${data.errmsg}`);
  return data.access_token as string;
}

export async function getUserByCode(code: string): Promise<WecomUser> {
  const token = await getAccessToken();

  // Step 1: code → UserId
  const infoRes = await fetch(
    `${WECOM_API}/user/getuserinfo?access_token=${token}&code=${code}`
  );
  const info = await infoRes.json();
  if (info.errcode !== 0) throw new Error(`getuserinfo failed: ${info.errmsg}`);
  const userId: string = info.UserId;

  // Step 2: UserId → user detail (name, avatar)
  const detailRes = await fetch(
    `${WECOM_API}/user/get?access_token=${token}&userid=${userId}`
  );
  const detail = await detailRes.json();
  const name: string = detail.name ?? userId;
  const avatar: string | undefined = detail.avatar || undefined;

  return { userId, name, avatar };
}

// ── OAuth URL builder ─────────────────────────────────────────────

export function buildOAuthUrl(redirectUri: string, state = "/"): string {
  const corpId = process.env.WECOM_CORP_ID;
  const agentId = process.env.WECOM_AGENT_ID;
  if (!corpId || !agentId) throw new Error("WECOM_CORP_ID or WECOM_AGENT_ID not configured");

  const params = new URLSearchParams({
    appid: corpId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "snsapi_base",
    agentid: agentId,
    state,
  });
  return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;
}
