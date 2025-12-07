<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 添加商品
      </el-button>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="search.keyword" 
        placeholder="搜索商品名称" 
        style="width: 240px"
        clearable
        @keyup.enter="fetchProducts"
      />
      <el-select v-model="search.category_id" placeholder="选择分类" clearable style="width: 160px">
        <el-option 
          v-for="cat in categories" 
          :key="cat.id" 
          :label="cat.name" 
          :value="cat.id" 
        />
      </el-select>
      <el-select v-model="search.is_available" placeholder="商品状态" clearable style="width: 120px">
        <el-option label="上架" :value="1" />
        <el-option label="下架" :value="0" />
      </el-select>
      <el-button type="primary" @click="fetchProducts">搜索</el-button>
    </div>
    
    <!-- 商品表格 -->
    <el-table :data="products" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <el-image 
            :src="row.images?.[0]" 
            class="table-image"
            fit="cover"
            :preview-src-list="row.images"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          ¥{{ row.price?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock_quantity" label="库存" width="80" />
      <el-table-column prop="sales_count" label="销量" width="80" />
      <el-table-column prop="is_available" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_available ? 'success' : 'info'">
            {{ row.is_available ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button 
            :type="row.is_available ? 'warning' : 'success'" 
            size="small"
            @click="toggleStatus(row)"
          >
            {{ row.is_available ? '下架' : '上架' }}
          </el-button>
          <el-button type="danger" size="small" @click="deleteProduct(row)">删除</el-button>
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
        @size-change="fetchProducts"
        @current-change="fetchProducts"
      />
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="选择分类" style="width: 100%">
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock_quantity">
          <el-input-number v-model="form.stock_quantity" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="图片URL" prop="images">
          <el-input v-model="form.images" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品描述" 
          />
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

const products = ref([])
const categories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const search = reactive({
  keyword: '',
  category_id: '',
  is_available: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  category_id: '',
  price: 0,
  stock_quantity: 0,
  images: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/api/products', {
      params: {
        page: pagination.page,
        limit: pagination.pageSize,
        keyword: search.keyword,
        category_id: search.category_id,
        is_available: search.is_available
      }
    })
    if (res.success) {
      products.value = res.data.products
      pagination.total = res.data.pagination.total
    }
  } catch (err) {
    console.error('获取商品列表失败:', err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/admin/api/products/categories')
    if (res.success) {
      categories.value = res.data.categories || res.data
    }
  } catch (err) {
    console.error('获取分类失败:', err)
  }
}

const openDialog = (product = null) => {
  isEdit.value = !!product
  if (product) {
    Object.assign(form, {
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      stock_quantity: product.stock_quantity,
      images: product.images?.[0] || '',
      description: product.description
    })
  } else {
    Object.assign(form, {
      id: null,
      name: '',
      category_id: '',
      price: 0,
      stock_quantity: 0,
      images: '',
      description: ''
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
      res = await api.put(`/admin/api/products/${form.id}`, form)
    } else {
      res = await api.post('/admin/api/products', form)
    }
    
    if (res.success) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      fetchProducts()
    }
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要${product.is_available ? '下架' : '上架'}商品 "${product.name}" 吗?`,
      '提示',
      { type: 'warning' }
    )
    
    const res = await api.post(`/admin/api/products/${product.id}/toggle`)
    if (res.success) {
      ElMessage.success('操作成功')
      fetchProducts()
    }
  } catch {
    // 取消操作
  }
}

const deleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${product.name}" 吗?`,
      '警告',
      { type: 'error' }
    )
    
    const res = await api.delete(`/admin/api/products/${product.id}`)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchProducts()
    }
  } catch {
    // 取消操作
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
