import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        minify: mode === 'development' ? false : 'esbuild',
        sourcemap: mode === 'development' ? true : false,
        manifest: true,
    },
    base: "./public",
}))
