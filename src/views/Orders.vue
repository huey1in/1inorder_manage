<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="search.keyword" 
        placeholder="订单号/手机号/用户名" 
        style="width: 200px"
        clearable
      />
      <el-select v-model="search.status" placeholder="订单状态" clearable style="width: 140px">
        <el-option label="待处理" value="pending" />
        <el-option label="已确认" value="confirmed" />
        <el-option label="制作中" value="preparing" />
        <el-option label="待取餐/配送中" value="ready" />
        <el-option label="已完成" value="delivered" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="search.payment_status" placeholder="支付状态" clearable style="width: 140px">
        <el-option label="未支付" value="unpaid" />
        <el-option label="已支付" value="paid" />
        <el-option label="已退款" value="refunded" />
      </el-select>
      <el-select v-model="search.order_type" placeholder="订单类型" clearable style="width: 140px">
        <el-option label="外卖配送" value="delivery" />
        <el-option label="到店自取" value="pickup" />
        <el-option label="堂食" value="dine_in" />
      </el-select>
      <el-button type="primary" @click="fetchOrders">搜索</el-button>
    </div>
    
    <!-- 订单表格 -->
    <el-table :data="orders" v-loading="loading" stripe>
      <el-table-column prop="order_number" label="订单号" width="160" />
      <el-table-column label="用户" width="120">
        <template #default="{ row }">
          {{ row.nickname || row.phone || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div class="order-items">
            <span v-if="row.items?.length">
              {{ row.items.map(i => `${i.product_name}×${i.quantity}`).join(', ') }}
            </span>
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="金额" width="100">
        <template #default="{ row }">
          ¥{{ (row.total_amount / 100).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="订单类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getOrderTypeType(row.order_type)" size="small">
            {{ getOrderTypeText(row.order_type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="payment_status" label="支付状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getPaymentType(row.payment_status)">
            {{ getPaymentText(row.payment_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" width="170">
        <template #default="{ row }">
          {{ row.created_at }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
            <el-button type="primary" size="small">
              修改状态 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="confirmed">已确认</el-dropdown-item>
                <el-dropdown-item command="preparing">制作中</el-dropdown-item>
                <el-dropdown-item command="ready">待取餐/配送中</el-dropdown-item>
                <el-dropdown-item command="delivered">已完成</el-dropdown-item>
                <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="danger" size="small" @click="deleteOrder(row)">删除</el-button>
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
        @size-change="fetchOrders"
        @current-change="fetchOrders"
      />
    </div>
    
    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="700px">
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ orderDetail.order_number }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ orderDetail.nickname || orderDetail.phone }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderDetail.status)">
              {{ getStatusText(orderDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="getPaymentType(orderDetail.payment_status)">
              {{ getPaymentText(orderDetail.payment_status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="getOrderTypeType(orderDetail.order_type)">
              {{ getOrderTypeText(orderDetail.order_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="取餐码" v-if="orderDetail.pickup_code">
            <span style="font-size: 18px; font-weight: bold; color: #E6A23C;">{{ orderDetail.pickup_code }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2" v-if="orderDetail.delivery_address">
            {{ orderDetail.delivery_address }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ orderDetail.contact_name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderDetail.contact_phone || orderDetail.phone }}</el-descriptions-item>
          <el-descriptions-item label="桌号" v-if="orderDetail.table_number">{{ orderDetail.table_number }}</el-descriptions-item>
          <el-descriptions-item label="商品金额">¥{{ (orderDetail.total_amount / 100).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="配送费">¥{{ (orderDetail.delivery_fee / 100).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ orderDetail.created_at }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ orderDetail.notes || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin: 20px 0 10px">商品列表</h4>
        <el-table :data="orderDetail.items" border size="small">
          <el-table-column label="商品图片" width="80">
            <template #default="{ row }">
              <el-image :src="row.images?.[0]" style="width: 50px; height: 50px" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ (row.price / 100).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity / 100).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

const orders = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const orderDetail = ref(null)

const search = reactive({
  keyword: '',
  status: '',
  payment_status: '',
  order_type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    confirmed: 'primary',
    preparing: 'info',
    ready: 'info',
    delivered: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    confirmed: '已确认',
    preparing: '制作中',
    ready: '待取餐/配送中',
    delivered: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const getPaymentType = (status) => {
  const types = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'info'
  }
  return types[status] || 'info'
}

const getPaymentText = (status) => {
  const texts = {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
  }
  return texts[status] || status
}

const getOrderTypeType = (type) => {
  const types = {
    delivery: 'primary',
    pickup: 'success',
    dine_in: 'warning'
  }
  return types[type] || 'info'
}

const getOrderTypeText = (type) => {
  const texts = {
    delivery: '外卖配送',
    pickup: '到店自取',
    dine_in: '堂食'
  }
  return texts[type] || type
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize
    }
    
    if (search.keyword) params.keyword = search.keyword
    if (search.status) params.status = search.status
    if (search.payment_status) params.payment_status = search.payment_status
    if (search.order_type) params.order_type = search.order_type
    
    const res = await api.get('/admin/api/orders', { params })
    if (res.success) {
      orders.value = res.data.orders || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (err) {
    console.error('获取订单列表失败:', err)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (order) => {
  try {
    const res = await api.get(`/admin/api/orders/${order.id}`)
    if (res.success) {
      orderDetail.value = res.data
      detailVisible.value = true
    }
  } catch (err) {
    ElMessage.error('获取订单详情失败')
  }
}

const handleCommand = async (command, order) => {
  if (!command) {
    ElMessage.error('无效的状态值')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态修改为 "${getStatusText(command)}" 吗?`,
      '提示',
      { type: 'warning' }
    )
    
    const res = await api.put(`/admin/api/orders/${order.id}/status`, { status: command })
    if (res.success) {
      ElMessage.success('状态修改成功')
      fetchOrders()
    } else {
      ElMessage.error(res.message || '状态修改失败')
    }
  } catch (err) {
    // 取消操作或请求失败
    if (err !== 'cancel' && err?.message !== 'cancel') {
      console.error('Update status error:', err)
    }
  }
}

const deleteOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 "${order.order_number}" 吗?`,
      '警告',
      { type: 'error' }
    )
    
    const res = await api.delete(`/admin/api/orders/${order.id}`)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchOrders()
    }
  } catch {
    // 取消操作
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
