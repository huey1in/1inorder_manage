<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="search.keyword" 
        placeholder="搜索昵称/手机号" 
        style="width: 240px"
        clearable
        @keyup.enter="fetchUsers"
      />
      <el-select v-model="search.status" placeholder="用户状态" clearable style="width: 120px">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="fetchUsers">搜索</el-button>
    </div>
    
    <!-- 用户表格 -->
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="40" />
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称">
        <template #default="{ row }">
          {{ row.nickname || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_active" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'">
            {{ row.is_active ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button 
            :type="row.is_active ? 'warning' : 'success'" 
            size="small"
            @click="toggleStatus(row)"
          >
            {{ row.is_active ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="small" @click="deleteUser(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchUsers"
        @current-change="fetchUsers"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

const users = ref([])
const loading = ref(false)

const search = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/api/users', {
      params: {
        page: pagination.page,
        limit: pagination.pageSize,
        keyword: search.keyword,
        status: search.status
      }
    })
    if (res.success) {
      users.value = res.data.users
      pagination.total = res.data.pagination.total
    }
  } catch (err) {
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要${user.is_active ? '禁用' : '启用'}用户 "${user.nickname || user.phone}" 吗?`,
      '提示',
      { type: 'warning' }
    )
    
    const res = await api.post(`/admin/api/users/${user.id}/toggle`)
    if (res.success) {
      ElMessage.success('操作成功')
      fetchUsers()
    }
  } catch {
    // 取消操作
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.nickname || user.phone}" 吗? 此操作不可恢复!`,
      '警告',
      { type: 'error' }
    )
    
    const res = await api.delete(`/admin/api/users/${user.id}`)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchUsers()
    }
  } catch {
    // 取消操作
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
