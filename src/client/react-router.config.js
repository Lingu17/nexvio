import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Server-side render by default. Set to false to enable SPA mode.
  ssr: true,
  presets: [vercelPreset()],
};
