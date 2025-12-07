<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="icon users">
          <el-icon><User /></el-icon>
        </div>
        <div class="info">
          <div class="value">{{ stats.userCount }}</div>
          <div class="label">用户总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="icon products">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="info">
          <div class="value">{{ stats.productCount }}</div>
          <div class="label">商品数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="icon orders">
          <el-icon><List /></el-icon>
        </div>
        <div class="info">
          <div class="value">{{ stats.monthlyOrders }}</div>
          <div class="label">本月订单</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="icon revenue">
          <el-icon><Money /></el-icon>
        </div>
        <div class="info">
          <div class="value">¥{{ stats.monthlyRevenue?.toFixed(2) || '0.00' }}</div>
          <div class="label">本月收入</div>
        </div>
      </div>
    </div>
    
    <!-- 今日数据 -->
    <div class="page-container">
      <div class="page-header">
        <h2>今日数据</h2>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-statistic title="今日订单" :value="stats.dailyOrders" />
        </el-col>
        <el-col :span="12">
          <el-statistic title="今日收入" :value="stats.dailyRevenue" :precision="2" prefix="¥" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const stats = ref({
  userCount: 0,
  productCount: 0,
  monthlyOrders: 0,
  dailyOrders: 0,
  monthlyRevenue: 0,
  dailyRevenue: 0
})

const fetchStats = async () => {
  try {
    const res = await api.get('/admin/api/dashboard')
    if (res.success) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
