import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: "index.html", 
        content: "src/contentScript.ts",
        background: "src/background.ts"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
