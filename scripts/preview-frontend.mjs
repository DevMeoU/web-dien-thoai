import { fileURLToPath } from 'node:url'
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js'

// Preview riêng để không trùng cổng với website thời trang cũ.
process.env.VITE_DEV_API = 'http://127.0.0.1:8001'
const root = fileURLToPath(new URL('../frontend', import.meta.url))
const server = await createServer({ root, configFile: `${root}/vite.config.js`, server: { host: '127.0.0.1', port: 5174, strictPort: true } })
await server.listen()
server.printUrls()
