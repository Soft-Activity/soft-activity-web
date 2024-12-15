import service from './service'
import { CONTENT_TYPE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { AxiosConfig, IResponse } from './types'

const request = <T = any>(url: string, option: Omit<AxiosConfig, 'url'>) => {
  const { method, params, data, headers, responseType } = option
  const userStore = useUserStoreWithOut()
  return service.request({
    url,
    method,
    params,
    data,
    responseType,
    headers: {
      'Content-Type': CONTENT_TYPE,
      [userStore.getTokenKey ?? 'Authorization']: userStore.getToken ?? '',
      ...headers
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
