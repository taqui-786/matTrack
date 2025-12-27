import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import netlify from "@netlify/vite-plugin";
export default defineConfig({
  plugins: [react(), tailwindcss(), netlify()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})