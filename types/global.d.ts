import type{ PropType as VuePropType } from 'vue'
import type { useDialog, useLoadingBar, useMessage } from 'naive-ui'

declare global {

  const __APP_INFO__: {
    pkg: {
      name: string
      version: string
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }
    lastBuildTime: string
  }

  type PropType<T> = VuePropType<T>

  interface Window {
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $message: ReturnType<typeof useMessage>
  }

  type Recordable<T = any> = Record<string, T>
}

export {}
