import pkg from '../../package.json'
import { getConfigFileName } from '../../build/getConfigFileName'
import { warn } from '@/utils/log'

export interface GlobEnvConfig {
  // 接口前缀
  VITE_GLOB_BASE_URL: string
  // 标题
  VITE_GLOB_APP_TITLE: string
  // 生产环境开启mock
  VITE_GLOB_PROD_MOCK: boolean
  // 项目简称
  VITE_GLOB_APP_SHORT_NAME: string
}

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppEnvConfig()
  return `${VITE_GLOB_APP_SHORT_NAME}__${getEnv()}`.toUpperCase()
}

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix()}${`__${pkg.version}`}__`.toUpperCase()
}

export function getAppEnvConfig() {
  const ENV_NAME = getConfigFileName(import.meta.env)

  // Get the global configuration (the configuration will be extracted independently when packaging)
  const ENV = isDevMode()
    ? import.meta.env as any as GlobEnvConfig
    : window[ENV_NAME] as GlobEnvConfig

  const {
    VITE_GLOB_BASE_URL,
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_PROD_MOCK,
    VITE_GLOB_APP_SHORT_NAME,
  } = ENV

  if (!/^[a-zA-Z\_]*$/.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      'VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.',
    )
  }

  return {
    VITE_GLOB_BASE_URL,
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_PROD_MOCK,
    VITE_GLOB_APP_SHORT_NAME,
  }
}

/**
 * @description: Development model
 */
export const devMode = 'development'

/**
 * @description: Production mode
 */
export const prodMode = 'production'

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE
}

/**
 * @description: Is it a development mode
 * @returns:
 * @example:
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV
}

/**
 * @description: Is it a production mode
 * @returns:
 * @example:
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD
}
