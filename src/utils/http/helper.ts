import { isObject, isString } from '@/utils/is'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm'

export function joinTimestamp<T extends boolean>(
  restful: T,
  join?: boolean
): T extends true ? string : object

export function joinTimestamp(restful = false, join?: boolean): string | object {
  if (!join)
    return restful ? '' : {}

  const now = new Date().getTime()
  if (restful)
    return `?_t=${now}`

  return { _t: now }
}

/**
 * @description: 格式化请求时间参数
 */
export function formatRequestDate(params: Recordable) {
  if (!isObject(params))
    return

  for (const key in params) {
    if (params[key]?._isAMomentObject)
      params[key] = params[key].format(DATE_TIME_FORMAT)

    if (isString(key)) {
      const value = params[key]
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value
        }
        catch (error) {
          throw new Error(error as any)
        }
      }
    }
    if (isObject(params[key]))
      formatRequestDate(params[key])
  }
}
