import type { AxiosRequestConfig } from 'axios'
import type { AxiosTransform } from './axiosTransform'

export interface CreateAxiosOptions extends AxiosRequestConfig {
  transform?: AxiosTransform
  requestOptions?: RequestOptions
  authenticationScheme?: string // 如果传值会拼接到token前面
}

// 上传文件
export interface UploadFileParams {
  // 其他参数
  data?: Recordable
  // 文件参数接口字段名
  name?: string
  // 文件
  file: File | Blob
  // 文件名称
  filename?: string
  [key: string]: any
}

export interface RequestOptions<T extends boolean = boolean> {
  // 格式化请求参数时间
  formatDate?: boolean
  // 成功的文本信息
  successMessageText?: string
  // 错误的文本信息
  errorMessageText?: string
  // get请求拼接时间戳
  joinTimestamp?: boolean
  // post请求参数拼接到url
  joinParamsToUrl?: boolean
  // 是否返回原生响应头
  isReturnNativeResponse?: T
  // 是否忽略重复请求
  ignoreCancelToken?: boolean
  // 是否携带token
  withToken?: boolean
}

export interface Result<T = any> {
  code: number
  type?: 'success' | 'error' | 'warning'
  message: string
  result: T
}
