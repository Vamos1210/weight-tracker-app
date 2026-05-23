import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "体重管理アプリ",
    short_name: "体重管理",
    description: "Weight Tracker App",
    start_url: "/",
    display: "standalone",

    background_color: "#ffffff",
    theme_color: "#27a239",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}