import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Socle · Patrimoine",
    short_name: "Socle",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#0f766e",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
