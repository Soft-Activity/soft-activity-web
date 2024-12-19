import service from './service'
import { useUserStoreWithOut } from '@/store/modules/user'
import { AxiosConfig, IResponse } from './types'

const request = <T = any>(url: string, option: Omit<AxiosConfig, 'url'>) => {
  const { method, params, data, headers, responseType } = option
  const userStore = useUserStoreWithOut()

  // 只在没有设置 Content-Type 时才设置默认值
  const defaultHeaders = {
    [userStore.getTokenKey ?? 'Authorization']: userStore.getToken ?? ''
  }

  return service.request({
    url,
    method,
    params,
    data,
    responseType,
    headers: {
      ...defaultHeaders,
      ...headers // 让传入的 headers 可以覆盖默认值
    }
  }) as Promise<IResponse<T>>
}

export default request

export const httpClient = {
  get: <T = any>(option: AxiosConfig) => {
    return request<T>(option.url, { method: 'get', ...option })
  },
  post: <T = any>(option: AxiosConfig) => {
    return request<T>(option.url, { method: 'post', ...option })
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request<T>(option.url, { method: 'delete', ...option })
  },
  put: <T = any>(option: AxiosConfig) => {
    return request<T>(option.url, { method: 'put', ...option })
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
