# 1inorder 管理后台

![GitHub License](https://img.shields.io/github/license/huey1in/1inorder_back)
![GitHub Stars](https://img.shields.io/github/stars/huey1in/1inorder_back)
![GitHub Forks](https://img.shields.io/github/forks/huey1in/1inorder_back)
![Vue](https://img.shields.io/badge/Vue-3.x-green)
![Vite](https://img.shields.io/badge/Vite-4.x-blue)

1inorder的管理后台，使用 Vue 3 + Vite 构建。

## 项目结构

```
manage/
├── src/
│   ├── main.js                         # 应用入口
│   ├── App.vue                         # 根组件
│   ├── layouts/
│   │   └── MainLayout.vue              # 主布局
│   ├── views/                          # 页面组件
│   │   ├── Dashboard.vue               # 仪表盘
│   │   ├── Categories.vue              # 分类管理
│   │   ├── Products.vue                # 产品管理
│   │   ├── Orders.vue                  # 订单管理
│   │   ├── Users.vue                   # 用户管理
│   │   └── Login.vue                   # 登录页
│   ├── router/
│   │   └── index.js                    # 路由配置
│   ├── stores/
│   │   └── user.js                     # Pinia 用户存储
│   ├── styles/
│   │   └── index.scss                  # 全局样式
│   └── utils/
│       └── api.js                      # API 请求封装
├── public/                              # 公共资源
├── .env.example                         # 环境变量模板
├── .gitignore                          # Git 忽略文件
├── vite.config.js                      # Vite 配置
├── package.json
└── index.html
```

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
cd manage
npm install
```

### 配置环境变量
```bash
# 复制模板文件
cp .env.example .env

# 编辑 .env 文件，配置：
# VITE_API_BASE_URL=http://localhost:3000
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本
```bash
npm run build
```


## 主要技术

- **框架**: Vue 3
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **HTTP 请求**: Axios
- **样式**: SCSS

## 开发规范

- 使用单文件组件（SFC）
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名使用 PascalCase
- 样式作用域使用 scoped
- 可复用逻辑提取为 Composables

## 页面说明

### Dashboard（仪表盘）
- 显示订单总数、用户总数、销售额等关键指标
- 图表展示销售趋势

### Categories（分类管理）
- 显示所有产品分类列表
- 支持新增、编辑、删除分类
- 实时更新分类状态

### Products（产品管理）
- 产品列表展示
- 支持搜索、筛选产品
- 上传产品图片
- 管理产品信息和价格

### Orders（订单管理）
- 订单列表和详情查看
- 订单状态流转
- 订单搜索和筛选

### Users（用户管理）
- 用户列表管理
- 用户信息查看
- 用户禁用/启用


## 许可证

MIT License

Copyright (c) 2025 huey1in

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 作者

1in
