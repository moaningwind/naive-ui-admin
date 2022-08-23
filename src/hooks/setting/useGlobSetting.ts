import { warn } from '@/utils/log'
import { getAppEnvConfig } from '@/utils/env'

export interface GlobConfig {
  title: string
  shortName: string
  baseUrl?: string
  prodMock: boolean
}

export function useGlobSetting(): Readonly<GlobConfig> {
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_BASE_URL,
    VITE_GLOB_PROD_MOCK,
  } = getAppEnvConfig()

  if (!/[a-zA-Z\_]*/.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      'VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.',
    )
  }

  // Take global configuration
  const glob = {
    title: VITE_GLOB_APP_TITLE,
    shortName: VITE_GLOB_APP_SHORT_NAME,
    baseUrl: VITE_GLOB_BASE_URL,
    prodMock: VITE_GLOB_PROD_MOCK,
  }
  return glob
}
