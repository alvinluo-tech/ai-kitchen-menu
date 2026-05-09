<div align="center">

# 🍳 AI 私厨电子菜单推荐器

**一个由 AI 驱动的智能私厨菜单系统**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.x-000?logo=vercel)](https://sdk.vercel.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<br />

<p align="center">
  <strong>朋友上传拿手菜，AI 根据口味/食材/忌口从真实菜单中推荐</strong>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-部署">部署</a> •
  <a href="#-贡献">贡献</a>
</p>

</div>

---

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 🎯 智能推荐系统
- 🤖 AI 驱动的菜品推荐
- 🧠 基于口味/食材/忌口的智能匹配
- 📊 多维度评分算法
- 💬 自然语言交互

</td>
<td width="50%">

### 🍽️ 菜单管理
- 📸 菜品图片上传与管理
- 🏷️ 灵活的标签系统
- 🥘 详细的食材清单
- 📖 菜品故事分享

</td>
</tr>
<tr>
<td>

### 👨‍🍳 厨师后台
- 🔐 安全的厨师认证系统
- ✏️ 菜品 CRUD 操作
- 📦 订单管理系统
- 🎙️ 语音菜品介绍

</td>
<td>

### 📱 用户体验
- 🌐 无需登录即可浏览
- 📲 PWA 支持离线访问
- 🛒 购物车功能
- 🎨 响应式设计

</td>
</tr>
</table>

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+ 
- [pnpm](https://pnpm.io/) 8+
- [Supabase](https://supabase.com/) 账号

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/ai-kitchen-menu.git
cd ai-kitchen-menu
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI 配置 (小米 MiMo)
XIAOMI_MIMO_BASE_URL=https://api.xiaomimimo.com/v1
XIAOMI_MIMO_API_KEY=your_api_key
XIAOMI_MIMO_MODEL=mimo-v2.5

# 应用配置
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### 4. 初始化数据库

```bash
# 使用 Supabase CLI
npx supabase link --project-ref your-project-id
npx supabase db push
npx supabase db seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3001](http://localhost:3001) 🎉

## 🛠️ 技术栈

<div align="center">

| 类别 | 技术 |
|:---:|:---|
| **框架** | ![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-black?logo=next.js) |
| **语言** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript) |
| **UI** | ![Tailwind](https://img.shields.io/badge/Tailwind_4-+shadcn/ui-38bdf8?logo=tailwindcss) |
| **数据库** | ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase) |
| **AI** | ![Vercel AI](https://img.shields.io/badge/Vercel_AI_SDK-MiMo_V2.5-000?logo=vercel) |
| **认证** | ![Supabase Auth](https://img.shields.io/badge/Supabase-Auth-3ecf8e?logo=supabase) |
| **存储** | ![Supabase Storage](https://img.shields.io/badge/Supabase-Storage-3ecf8e?logo=supabase) |
| **部署** | ![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel) |

</div>

## 📁 项目结构

```
ai-kitchen-menu/
├── 📂 app/                      # Next.js App Router
│   ├── 📄 page.tsx              # 首页
│   ├── 📂 menu/                 # 公开菜单页
│   │   └── 📂 [slug]/           # 菜品详情页
│   ├── 📂 recommend/            # AI 推荐页
│   ├── 📂 chefs/                # 厨师风采页
│   ├── 📂 login/                # 厨师登录页
│   ├── 📂 order/                # 点餐页
│   ├── 📂 admin/                # 后台管理
│   │   ├── 📂 dishes/           # 菜品管理
│   │   ├── 📂 orders/           # 订单管理
│   │   └── 📂 profile/          # 个人资料
│   └── 📂 api/                  # API 路由
│       ├── 📂 recommend/        # AI 推荐 API
│       ├── 📂 dishes/           # 菜品 CRUD
│       └── 📂 orders/           # 订单 API
│
├── 📂 components/               # React 组件
│   ├── 📂 ui/                   # shadcn/ui 组件
│   ├── 📂 dish-form/            # 菜品表单组件
│   └── 📄 *.tsx                 # 业务组件
│
├── 📂 lib/                      # 核心库
│   ├── 📂 ai/                   # AI 推荐逻辑
│   ├── 📂 dishes/               # 菜品查询与评分
│   ├── 📂 supabase/             # Supabase 客户端
│   └── 📂 services/             # 业务服务
│
├── 📂 supabase/                 # 数据库
│   ├── 📂 migrations/           # 数据库迁移
│   ├── 📄 schema.sql            # 表结构
│   └── 📄 seed.sql              # 种子数据
│
└── 📂 public/                   # 静态资源
    ├── 📂 icons/                # PWA 图标
    └── 📄 sw.js                 # Service Worker
```

## 🔧 配置说明

### Supabase 配置

1. 创建 Supabase 项目
2. 运行数据库迁移：
   ```bash
   npx supabase db push
   ```
3. 创建 Storage Bucket：`dish-images`
4. 配置 RLS 策略（已包含在迁移中）

### AI 配置

本项目使用小米 MiMo-V2.5 模型，需要：
1. 获取 API Key
2. 配置环境变量

## 🚢 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-kitchen-menu)

1. Fork 本仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 完成部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-kitchen-menu .

# 运行容器
docker run -p 3001:3001 --env-file .env.local ai-kitchen-menu
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 编写有意义的提交信息
- 为新功能添加测试

## 📝 更新日志

### v1.0.0 (2026-05-09)
- 🎉 初始发布
- ✨ AI 智能推荐功能
- 🍽️ 完整的菜单管理系统
- 👨‍🍳 厨师后台
- 📱 PWA 支持

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 后端即服务
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 集成
- [小米 MiMo](https://xiaomi.com/) - AI 模型

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

**如果觉得这个项目有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by [Your Name](https://github.com/yourusername)

</div>
