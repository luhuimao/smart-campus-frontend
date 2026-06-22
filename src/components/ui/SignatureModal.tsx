"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

export function SignatureModal({
  open,
  onClose,
  onSigned,
  appId,
  entryId,
}: {
  open: boolean;
  onClose: () => void;
  onSigned: (imageKey: string, imageDataUrl: string) => void;
  appId?: string;
  entryId?: string;
}) {
  const [token, setToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [phase, setPhase] = useState<"loading" | "scanning" | "signed">("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    setQrDataUrl("");

    fetch("/api/sign/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, entryId }),
    })
      .then((r) => r.json())
      .then(async (data: { token: string; qrUrl: string }) => {
        setToken(data.token);
        const dataUrl = await QRCode.toDataURL(data.qrUrl, { width: 240, margin: 2 });
        setQrDataUrl(dataUrl);
        setPhase("scanning");
      })
      .catch(() => setPhase("loading"));

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open]);

  // Poll for status
  useEffect(() => {
    if (!token || phase !== "scanning") return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sign/status/${token}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "signed") {
          clearInterval(pollRef.current);
          console.log("[sign-modal] poll received signed, imageKey:", data.imageKey, "dataUrl len:", data.imageDataUrl?.length ?? 0, "preview:", data.imageDataUrl?.slice(0, 50));
          setPhase("signed");
          onSigned(data.imageKey ?? "", data.imageDataUrl ?? "");
          setTimeout(() => onClose(), 800);
        }
      } catch {}
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, phase, onSigned, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {phase === "signed" ? "签名完成" : "手机扫码签字"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {phase === "loading" && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        )}

        {phase === "scanning" && qrDataUrl && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <img src={qrDataUrl} alt="签名二维码" className="w-60 h-60" />
            </div>
            <p className="text-sm text-gray-500">请使用手机扫描二维码进行签字</p>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {phase === "signed" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-base font-semibold text-gray-800">签字已完成</p>
          </div>
        )}
      </div>
    </div>
  );
}
