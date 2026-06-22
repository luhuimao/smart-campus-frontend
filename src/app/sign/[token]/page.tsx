"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { jdyUploadFiles } from "@/lib/jdy-api";

export default function SignPage() {
  const params = useParams();
  const token = params?.token as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [status, setStatus] = useState<"ready" | "uploading" | "done" | "error" | "expired">("ready");
  const [errorMsg, setErrorMsg] = useState("");
  const [appId, setAppId] = useState("");
  const [entryId, setEntryId] = useState("");

  // Fetch appId/entryId from token status
  useEffect(() => {
    if (!token) return;
    fetch(`/api/sign/status/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.appId) setAppId(data.appId);
        if (data.entryId) setEntryId(data.entryId);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1d1d1f";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
    setHasSignature(true);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    setDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  async function handleConfirm() {
    if (!hasSignature || !token) return;
    setStatus("uploading");
    try {
      const canvas = canvasRef.current!;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), "image/png");
      });
      const file = new File([blob], `signature-${token}.png`, { type: "image/png" });

      const result = await jdyUploadFiles(
        [file],
        appId,
        entryId,
      );

      const imageKey = result.keys[0];
      const imageDataUrl = canvas.toDataURL("image/png");
      console.log("[sign-page] sending confirm, imageKey:", imageKey, "dataUrl len:", imageDataUrl.length, "preview:", imageDataUrl.slice(0, 50));

      const res = await fetch("/api/sign/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, imageKey, imageDataUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Confirm failed");
      }

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "提交失败");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">签名提交成功</h2>
        <p className="text-gray-500 text-sm">签名已回传，请返回电脑继续操作</p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6" style={{ fontFamily: "system-ui, sans-serif" }}>
        <p className="text-gray-500 text-lg">二维码已过期，请刷新后重试</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">手写签名</h1>
        <span className="text-xs text-gray-400">{status === "uploading" ? "提交中..." : "请在下方签字"}</span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-4">
        <div className="relative flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden" style={{ minHeight: 240 }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-300 text-base">请在此处签名</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-sm text-red-500 mt-3 text-center">{errorMsg}</p>
        )}

        <div className="flex gap-3 mt-5 pb-5">
          <button
            onClick={clearCanvas}
            disabled={status === "uploading"}
            className="flex-1 py-3 rounded-xl text-base font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            重新签名
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasSignature || status === "uploading"}
            className="flex-1 py-3 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: status === "uploading" ? "#9ca3af" : "#00b095", boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          >
            {status === "uploading" ? "提交中..." : "确认提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
