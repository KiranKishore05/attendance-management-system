import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Expose NEXT_PUBLIC_* vars (provided by the Supabase integration) to the client,
  // alongside the default VITE_* prefix.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: {
    host: true,
    allowedHosts: true,
  },
})
