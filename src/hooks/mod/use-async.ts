import type { Ref } from 'vue'

export const useAsync = async <T>(func: Promise<T>, loading: Ref<boolean>): Promise<T> => {
  loading.value = true

  return await func.finally(() => (loading.value = false))
}
