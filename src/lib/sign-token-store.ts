// In-memory token store for signature QR code flow.
// Tokens expire after 5 minutes. Cleanup runs on each access.

const TOKEN_TTL_MS = 5 * 60 * 1000;

interface TokenEntry {
  status: "pending" | "signed";
  createdAt: number;
  appId?: string;
  entryId?: string;
  imageKey?: string;
  imageDataUrl?: string;
}

const store = new Map<string, TokenEntry>();

function cleanup() {
  const now = Date.now();
  for (const [token, entry] of store) {
    if (now - entry.createdAt > TOKEN_TTL_MS) store.delete(token);
  }
}

export function createSignToken(opts?: { appId?: string; entryId?: string }): string {
  cleanup();
  const token = crypto.randomUUID();
  store.set(token, { status: "pending", createdAt: Date.now(), appId: opts?.appId, entryId: opts?.entryId });
  return token;
}

export function getTokenStatus(token: string): { status: string; appId?: string; entryId?: string; imageKey?: string; imageDataUrl?: string } | null {
  cleanup();
  const entry = store.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) { store.delete(token); return null; }
  return { status: entry.status, appId: entry.appId, entryId: entry.entryId, imageKey: entry.imageKey, imageDataUrl: entry.imageDataUrl };
}

export function confirmSignToken(token: string, imageKey: string, imageDataUrl: string): boolean {
  cleanup();
  const entry = store.get(token);
  if (!entry || entry.status !== "pending") return false;
  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) { store.delete(token); return false; }
  entry.status = "signed";
  entry.imageKey = imageKey;
  entry.imageDataUrl = imageDataUrl;
  console.log("[token-store] confirmSignToken stored, dataUrl len:", imageDataUrl.length, "preview:", imageDataUrl.slice(0, 50));
  return true;
}
