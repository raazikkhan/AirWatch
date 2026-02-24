import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AirWatch - Air Quality Monitoring App",
    short_name: "AirWatch",
    description:
      "AirWatch is a web application that allows you to monitor the air quality in your area.",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    start_url: "/",
    scope: "/",
    theme_color: "#000000",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait-primary",
  };
}
