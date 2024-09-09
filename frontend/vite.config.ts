import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import Checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.BASE || '/', // Use the base URL from the environment variables or default to '/'
    resolve: {
      alias: {
        "@": resolve(__dirname, "src")
      }
    },
    plugins: [
      react(),
      Checker({ typescript: true }),
      svgr(),
      visualizer(),
      nodePolyfills()
    ],
    server: {
      port: 3002
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-router-dom", "react-dom"],
            "wagmi-vendor": ["wagmi", "viem"],
            "ui-vendor": ["antd"]
          }
        }
      }
    },
    optimizeDeps: {
      include: ["react-dom"]
    }
  };
});
