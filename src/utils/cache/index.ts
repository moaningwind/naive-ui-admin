import { WebStorage } from './WebStorage'

export const defaultKey = 'NAIVE_UI_ADMIN'

function createStorage({ prefixKey = defaultKey, storage = localStorage }: {
  prefixKey?: string
  storage?: Storage
}) {
  return new WebStorage({ prefixKey, storage })
}

export function createLocalStorage(prefixKey = defaultKey) {
  return createStorage({ prefixKey, storage: localStorage })
}

export function createSessionStorage(prefixKey = defaultKey) {
  return createStorage({ prefixKey, storage: sessionStorage })
}
