import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  
  const isLoggedIn = computed(() => !!user.value)
  
  async function login(phone, password) {
    const res = await api.post('/admin/api/login', { phone, password })
    if (res.success) {
      user.value = res.user
    }
    return res
  }
  
  async function logout() {
    await api.post('/admin/api/logout')
    user.value = null
  }
  
  async function checkAuth() {
    const res = await api.get('/admin/api/auth/check')
    if (res.success) {
      user.value = res.user
    } else {
      user.value = null
      throw new Error('未登录')
    }
  }
  
  return {
    user,
    isLoggedIn,
    login,
    logout,
    checkAuth
  }
})
