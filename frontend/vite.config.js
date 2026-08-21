import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react(), tailwindcss()],
        server: {
            port: parseInt(env.VITE_PORT) || 5173,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    secure: false,
                },
                '/uploads': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    }
})
