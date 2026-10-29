import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";
export const alt = `${SITE_NAME}: JSON Viewer, Formatter & Converter`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#1e1e1e",
          color: "#d4d4d4",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, color: "#3794ff" }}>{"{ }"}</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 10, color: "#ffffff" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 38, marginTop: 14 }}>JSON Viewer, Formatter &amp; Converter</div>
        <div style={{ fontSize: 30, marginTop: 36, color: "#4ec9b0" }}>100% client-side. Your data never leaves your browser.</div>
      </div>
    ),
    size,
  );
}
