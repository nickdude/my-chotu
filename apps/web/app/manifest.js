export default function manifest() {
  return {
    name:             "My Chotu",
    short_name:       "My Chotu",
    description:      "Your neighbourhood. Just a tap away.",
    start_url:        "/",
    display:          "standalone",
    background_color: "#FFFDF9",
    theme_color:      "#152744",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
