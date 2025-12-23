import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Apollo Client'ın v3 sürümlerinde ihtiyaç duyduğu geliştirme modu değişkeni
    __DEV__: true,
  },
});
