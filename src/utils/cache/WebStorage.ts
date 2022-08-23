// TODO Implement encryption and decryption

import { startsWith } from 'lodash-es'

export interface Options {
  expires?: number // 过期时间 单位: 天
  isOnce?: boolean // 是否读取一次后删除
}

export interface KeyInfo extends Options {
  timestamp: number
}

export interface RealStorageValue<T = unknown> {
  data: T
  keyInfo: KeyInfo
}

export class WebStorage {
  private prefixKey: string
  private storage: Storage

  constructor({ prefixKey, storage }: {
    prefixKey: string
    storage: Storage
  }) {
    this.prefixKey = prefixKey
    this.storage = storage
  }

  // 存数据前处理
  private _getInputData(data: unknown, options: Options) {
    const _data = {
      data,
      keyInfo: Object.assign(options, {
        timestamp: new Date().getTime(),
      }),
    }

    return JSON.stringify(_data)
  }

  // 取数据后处理
  private _getOutputData<T>(data: string | null): RealStorageValue<T> | null {
    // @ts-expect-error JSON.parse 可以传入null
    const _data = JSON.parse(data)

    return _data
  }

  // 获取_key的数据 => { data, keyInfo }
  private _getData<T>(_key: string) {
    const _data = this.storage.getItem(_key)

    return this._getOutputData<T>(_data)
  }

  // 特殊处理key
  private _getKey(key: string) {
    return `__${this.prefixKey}_${key}`
  }

  private _remove(_key: string) {
    this.storage.removeItem(_key)
  }

  /**
   * @description: 是否存在但是已经过期
   */
  private _isExpired<T>(_key: string, _data: RealStorageValue<T>) {
    const { keyInfo } = _data

    const { expires, timestamp } = keyInfo

    // 没有设置过期时间
    if (!expires)
      return false

    return timestamp + expires * 24 * 3600 * 1000 - new Date().getTime() < 0
  }

  /**
   * @description: 是否存在且只能读取一次
   */
  private _isOnce<T>(_key: string, _data: RealStorageValue<T>) {
    const { keyInfo } = this._getData(_key)!

    const { isOnce } = keyInfo

    return !!isOnce
  }

  get<T = unknown>(key: string): T | undefined

  get<T = unknown>(key: string, def: T): T

  get<T = unknown>(key: string, def?: T) {
    const _key = this._getKey(key)
    const _data = this._getData<T>(_key)

    if (!_data)
      return def

    const isExpired = this._isExpired<T>(_key, _data)
    const isOnce = this._isOnce<T>(_key, _data)

    if (isExpired || isOnce)
      this._remove(_key)

    return isExpired ? def : _data.data
  }

  set(key: string, data: unknown, options: Options = {}) {
    const _key = this._getKey(key)
    const _data = this._getInputData(data, options)

    this.storage.setItem(_key, _data)
  }

  /**
   * @description: 写入一个读取一次后删除的key
   */
  once(key: string, data: unknown, options: Omit<Options, 'isOnce'> = {}) {
    this.set(key, data, Object.assign(options, {
      isOnce: true,
    }))
  }

  remove(key: string) {
    const _key = this._getKey(key)

    this._remove(_key)
  }

  /**
   * @description: 遍历当前实例内的所有键值对
   */
  each(callbackfn: (key: string, value: unknown) => void) {
    for (let i = this.storage.length - 1; i >= 0; i--) {
      const _key = this.storage.key(i)!

      // 如果以`__${this.prefixKey}_`开头 说明键值对是当前实例创建的
      if (startsWith(_key!, `__${this.prefixKey}_`)) {
        const key = _key.split[`__${this.prefixKey}_`][1] as string

        callbackfn(key, this.get(key))
      }
    }
  }

  /**
   * @description: 遍历清除当前实例内的所有键值对
   */
  clear() {
    this.each((key) => {
      this.remove(key)
    })
  }

  /**
   * @description: 清空整个storage的所有键值对（包括不是当前实例创建的）
   */
  clearAll() {
    this.storage.clear()
  }
}
