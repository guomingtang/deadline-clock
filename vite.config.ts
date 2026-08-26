import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  server: { host: "0.0.0.0" },
  plugins: [vinext()],
});
