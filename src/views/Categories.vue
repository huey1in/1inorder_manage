<template>
  <div class="page-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 添加分类
      </el-button>
    </div>
    
    <!-- 分类表格 -->
    <el-table :data="categories" v-loading="loading" stripe row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image 
            v-if="row.image" 
            :src="row.image" 
            style="width: 40px; height: 40px" 
            fit="cover"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="description" label="描述">
        <template #default="{ row }">
          {{ row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column prop="is_active" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'info'">
            {{ row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button 
            :type="row.is_active ? 'warning' : 'success'" 
            size="small"
            @click="toggleStatus(row)"
          >
            {{ row.is_active ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="small" @click="deleteCategory(row)">删除</el-button>
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
        @size-change="fetchCategories"
        @current-change="fetchCategories"
      />
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="父分类" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="选择父分类(可选)" clearable style="width: 100%">
            <el-option 
              v-for="cat in parentCategories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片URL" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

const categories = ref([])
const parentCategories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  description: '',
  parent_id: null,
  image: '',
  sort_order: 0
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/api/categories', {
      params: {
        page: pagination.page,
        limit: pagination.pageSize
      }
    })
    if (res.success) {
      // 兼容两种响应格式：带分页和不带分页
      if (Array.isArray(res.data.categories)) {
        categories.value = res.data.categories
        pagination.total = res.data.pagination?.total || res.data.categories.length
      } else if (Array.isArray(res.data)) {
        categories.value = res.data
        pagination.total = res.data.length
      }
    }
  } catch (err) {
    console.error('获取分类列表失败:', err)
  } finally {
    loading.value = false
  }
}

const fetchParentCategories = async () => {
  try {
    const res = await api.get('/admin/api/categories/parents')
    if (res.success) {
      parentCategories.value = res.data.categories || res.data
    }
  } catch (err) {
    console.error('获取父分类失败:', err)
  }
}

const openDialog = (category = null) => {
  isEdit.value = !!category
  fetchParentCategories()
  
  if (category) {
    Object.assign(form, {
      id: category.id,
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id,
      image: category.image || '',
      sort_order: category.sort_order
    })
  } else {
    Object.assign(form, {
      id: null,
      name: '',
      description: '',
      parent_id: null,
      image: '',
      sort_order: 0
    })
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      res = await api.put(`/admin/api/categories/${form.id}`, form)
    } else {
      res = await api.post('/admin/api/categories', form)
    }
    
    if (res.success) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      fetchCategories()
    }
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (category) => {
  try {
    await ElMessageBox.confirm(
      `确定要${category.is_active ? '禁用' : '启用'}分类 "${category.name}" 吗?`,
      '提示',
      { type: 'warning' }
    )
    
    const res = await api.post(`/admin/api/categories/${category.id}/toggle`)
    if (res.success) {
      ElMessage.success('操作成功')
      fetchCategories()
    }
  } catch {
    // 取消操作
  }
}

const deleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${category.name}" 吗?`,
      '警告',
      { type: 'error' }
    )
    
    const res = await api.delete(`/admin/api/categories/${category.id}`)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchCategories()
    }
  } catch {
    // 取消操作
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
