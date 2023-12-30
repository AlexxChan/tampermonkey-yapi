import axios, { AxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({})

type ApiResult<T> = T

export async function get<T>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  const response = await axiosInstance.get<ApiResult<T>>(url, { params, ...config })
  return response.data
}

export async function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  const response = await axiosInstance.post<ApiResult<T>>(url, data, config)
  return response.data
}

export async function request<T>(
  ...args: Parameters<typeof axiosInstance.request>
): Promise<ApiResult<T>> {
  const response = await axiosInstance.request<ApiResult<T>>(...args)
  return response.data
}

export default {
  get,
  post,
  request
}
