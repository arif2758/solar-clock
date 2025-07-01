import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevRatul Solar Clock",
    short_name: "DevRatul",
    description:
      "A beautifully aligned solar clock that syncs with your location and visualizes time since sunset. Designed with elegance, stars, and real-time sunset countdown.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpg",
        purpose: "maskable",
      },
      {
        src: "/icon-192x192.jpg",
        sizes: "512x512",
        type: "image/jpg",
        purpose: "any",
      },


       {
        src: "/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpg",
        purpose: "maskable",
      },
      {
        src: "icon-192x192.jpg",
        sizes: "512x512",
        type: "image/jpg",
        purpose: "any",
      },
      {
        src: "icon-192x192.jpg",
        sizes: "180x180",
        type: "image/jpg",
      },
      {
        src: "icon-192x192.jpg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
    ],
  };
}
