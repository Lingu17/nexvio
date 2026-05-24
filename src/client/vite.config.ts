import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
  },
  server: {
    proxy: {
      "/api/posture": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/api/v1": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
});
