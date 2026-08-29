import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteSingleFile(), tsconfigPaths()],
  build: {
    target: "es2020",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    minify: true,
    lib: {
      entry: "src/thin-markdown-editor.ts",
      name: "ThinMarkdownEditor",
      fileName: () => "thin-markdown-editor.js",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
    },
    outDir: `./dist/`,
  },
});
