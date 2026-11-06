import { ImageResponse } from "next/og";

const S = 512;
export const size = { width: S, height: S };
export const contentType = "image/png";

export default function Icon() {
  const side = Math.round(S * 0.28);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f766e" }}>
        <div style={{ width: 0, height: 0, borderLeft: `${side}px solid transparent`, borderRight: `${side}px solid transparent`, borderBottom: `${Math.round(S * 0.48)}px solid white`, marginTop: -Math.round(S * 0.06) }} />
      </div>
    ),
    size,
  );
}
