import { resolve } from 'path'
import { defineConfig } from 'vite'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /\/#\//,
        replacement: `${pathResolve('types')}/`,
      },
      {
        find: '@',
        replacement: `${pathResolve('src')}/`,
      },
    ],
    dedupe: ['vue'],
  },
})

