import Mock from 'mockjs'

export function resultSuccess(result, { message = '' } = {}) {
  return Mock.mock({
    code: 200,
    message,
    result,
    type: 'success',
  })
}

export function resultPageSuccess<T = any>(
  page: number,
  pageSize: number,
  list: T[],
  { message = 'ok' } = {},
) {
  const pageData = pagination(page, pageSize, list)

  return {
    ...resultSuccess({
      page,
      pageSize,
      pageCount: list.length,
      list: pageData,
    }),
    message,
  }
}

export function resultError(message = 'Request failed', { code = -1, result = null } = {}) {
  return {
    code,
    result,
    message,
    type: 'error',
  }
}

export function pagination<T = any>(pageNo: number, pageSize: number, array: T[]): T[] {
  const offset = (pageNo - 1) * Number(pageSize)
  const ret
    = offset + Number(pageSize) >= array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + Number(pageSize))
  return ret
}

/**
 * @param {Number} times The number of times the callback function needs to be executed
 * @param {Function} callback
 */
export function doCustomTimes(times: number, callback: any) {
  let i = -1
  while (++i < times)
    callback(i)
}

export interface requestParams {
  method: string
  body: any
  headers?: { token?: string }
  query: any
}

export function getRequestToken({ headers }: requestParams): string | undefined {
  return headers?.token
}
