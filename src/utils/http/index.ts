// axios配置  可自行根据项目进行更改 只需更改该文件即可 其他文件可以不动
import type { AxiosResponse } from 'axios'
import qs from 'qs'
import axios from 'axios'
import { VAxios } from './Axios'
import type { AxiosTransform } from './axiosTransform'
import { checkStatus } from './checkStatus'
import { formatRequestDate, joinTimestamp } from './helper'
import type { CreateAxiosOptions, RequestOptions, Result } from './types'
import { ContentTypeEnum, RequestEnum, ResultEnum } from '@/enums/httpEnum'
import { PageEnum } from '@/enums/pageEnum'
import { useGlobSetting } from '@/hooks/setting/useGlobSetting'
import { isString } from '@/utils/is'
import { deepAssign } from '@/utils'
import { useUserStoreWidthOut } from '@/store/modules/user'
import router from '@/router'
import { createLocalStorage } from '@/utils/cache'

const storage = createLocalStorage()

const globSetting = useGlobSetting()

const $dialog = window.$dialog

const $message = window.$message

/**
 * @description: 数据处理 方便区分多种处理方式
 */
const transform: AxiosTransform = {

  beforeRequestHook(config, options) {
    const { joinParamsToUrl, formatDate, joinTimestamp: joinTime } = options

    const params = config.params || {}
    const data = config.data || false
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数 避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(false, joinTime))
      }
      else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(true, joinTime)}`
        config.params = undefined
      }
    }
    else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data
          config.params = params
        }
        else {
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          const query = qs.stringify(Object.assign({}, config.params, config.data))
          config.url = `${config.url}?${query}`
        }
      }
      else {
        // 兼容restful风格
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  transformRequestData<T>(res: AxiosResponse<Result<T>>, options: RequestOptions) {
    const {
      errorMessageText,
      successMessageText,
      isReturnNativeResponse,
    } = options

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse)
      return res

    const { data } = res
    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error('请求出错 请稍候重试')
    }

    // 这里 code result message为 后台统一的字段 需要修改为项目自己的接口返回格式
    const { code, message } = data
    const hasSuccess = Reflect.has(data, 'code') && code === ResultEnum.SUCCESS

    if (hasSuccess) {
      // 忽略空字符串
      (successMessageText || message) && $message.success(successMessageText || message)
    }
    else {
      // 接口请求成功但code码错误 统一提示错误信息
      switch (code) {
        case ResultEnum.ERROR:
          $message.error('请求失败')
          break
        // 登录超时
        case ResultEnum.TIMEOUT:
          if (router.currentRoute.value?.name === PageEnum.BASE_LOGIN_NAME) { $message.error('登录超时') }
          else {
            $dialog.warning({
              title: '提示',
              content: '登录身份已失效 请重新登录!',
              positiveText: '确定',
              // negativeText: '取消',
              closable: false,
              maskClosable: false,
              onPositiveClick: () => {
                storage.clear()
                // 到登录页
                window.location.href = PageEnum.BASE_LOGIN
              },
              onNegativeClick: () => {},
            })
          }
          break
        default:
          // 忽略空字符串
          (errorMessageText || message) && $message.error(errorMessageText || message)
          break
      }
    }
    return data
  },

  requestInterceptors(config, options) {
    // 请求之前处理config
    const userStore = useUserStoreWidthOut()
    const token = userStore.token
    if (token && config?.requestOptions?.withToken !== false) {
      // jwt token
      config.headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token
    }
    return config
  },

  responseInterceptorsCatch(error: any) {
    // TODO 此处要根据后端接口返回格式修改
    const { response, code, message } = error || {}
    const err = error.toString()
    try {
      if (code === 'ECONNABORTED' && message.includes('timeout')) {
        $message.error('接口请求超时 请刷新页面重试!')
        return
      }
      if (err && err.includes('Network Error')) {
        $dialog.info({
          title: '网络异常',
          content: '请检查您的网络连接是否正常',
          positiveText: '确定',
          // negativeText: '取消',
          closable: false,
          maskClosable: false,
          onPositiveClick: () => {},
          onNegativeClick: () => {},
        })
        return Promise.reject(error)
      }
    }
    catch (error) {
      throw new Error(error as any)
    }
    // 请求是否被取消
    if (!axios.isCancel(error))
      checkStatus(error.response && error.response.status)
    else
      console.warn(error, '请求被取消')

    // return Promise.reject(error);
    return Promise.reject(response?.data)
  },
}

function createAxios(opt?: CreateAxiosOptions) {
  const baseOpt: CreateAxiosOptions = {
    baseURL: globSetting.baseUrl,
    timeout: 10 * 1000,
    headers: { 'Content-Type': ContentTypeEnum.JSON },
    // 数据处理方式
    transform,
    // 配置项 下面的选项都可以在独立的接口请求中覆盖
    requestOptions: {
      // get请求拼接时间戳
      joinTimestamp: true,
      // 格式化提交参数时间
      formatDate: true,
      // 忽略重复请求
      ignoreCancelToken: true,
      // 携带token
      withToken: true,
    },
    withCredentials: false,
  }
  return new VAxios(
    deepAssign(
      baseOpt,
      opt || {},
    ),
  )
}

export const http = createAxios()
