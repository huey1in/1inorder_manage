import axios from 'axios'
import { ElMessage } from 'element-plus'

// 开发环境使用代理，生产环境直接访问后端 API 服务器
const baseURL = import.meta.env.DEV ? '' : 'https://order.yinxh.fun'

const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || '请求失败'
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default instance
