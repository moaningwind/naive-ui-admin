import type { Plugin } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'

import AutoImport from 'unplugin-auto-import/vite'

import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import type { ViteEnv } from 'build/utils'
import { configHtmlPlugin } from './html'
import { configMockPlugin } from './mock'
import { configCompressPlugin } from './compress'

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean, prodMock: boolean) {
  const { VITE_USE_MOCK, VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = viteEnv

  const vitePlugins: (Plugin | Plugin[])[] = [
    // have to
    vue(),

    // have to
    vueJsx(),

    Unocss(),

    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // global imports to register
      imports: [
        // presets
        'vue',
        // custom
        {
          '@vueuse/core': [
            // named imports
            'useVModel',
            'useLocalStorage',
            'useSessionStorage',
            'useDebounceFn',
            'useThrottleFn',
            'useEventListener', // import { useEventListener } from '@vueuse/core',
            // alias
            // ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
          ],
          // axios: [
          //   // default imports
          //   ['default', 'axios'], // import { default as axios } from 'axios',
          // ],
        },
      ],
    }),

    // Import NaiveUi on demand and automatically create component declarations
    Components({
      dts: true,
      resolvers: [NaiveUiResolver()],
    }),
  ]

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  // vite-plugin-mock
  VITE_USE_MOCK && vitePlugins.push(configMockPlugin(isBuild, prodMock))

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE),
    )
  }

  return vitePlugins
}
