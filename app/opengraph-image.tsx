// LinkedIn / Twitter / Slack / iMessage preview card.
//
// Next.js's convention: a default export from `app/opengraph-image.{ts,tsx}`
// is rendered to a PNG at runtime and the corresponding <meta property="og:image">
// is auto-injected into every page's <head>. No extra dependencies.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Siddharth Kamboj — RAG-powered portfolio chat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06060f",
          backgroundImage:
            "radial-gradient(circle at 50% 45%, #1b1b3a 0%, #0a0a18 55%, #06060f 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* SK monogram, top-left */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 14,
            backgroundColor: "#06060f",
            border: "1px solid rgba(255,255,255,0.15)",
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "-2px",
          }}
        >
          SK
        </div>

        {/* Tiny eyebrow label */}
        <div
          style={{
            display: "flex",
            opacity: 0.55,
            fontSize: 20,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          RAG-powered portfolio chat
        </div>

        {/* Headline — matches the chat's hero text */}
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            textAlign: "center",
            maxWidth: 1000,
          }}
        >
          Ask me anything about Siddharth.
        </div>

        {/* Subline with link */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 28,
            opacity: 0.7,
          }}
        >
          Siddharth Kamboj · sid2001.vercel.app/chat
        </div>
      </div>
    ),
    { ...size }
  );
}
