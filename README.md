# AI 私厨电子菜单推荐器

一个朋友私厨电子菜单。朋友上传自己会做的菜，用户输入今天想吃的味道、现有食材和忌口，AI 从真实菜单中推荐最适合的几道菜，并用可点击的菜品卡片展示。

## 功能特性

- **公开菜单浏览**：无需登录即可浏览所有菜品
- **AI 智能推荐**：输入自然语言描述，AI 从真实菜品中推荐
- **后台管理**：厨师可以新增、编辑、删除菜品
- **图片上传**：支持菜品图片上传

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Postgres + Storage)
- Vercel AI SDK + 小米 MiMo-V2.5

## 用户登录策略

本项目只有上传和管理菜品的人需要登录。

**普通访问者无需注册或登录**，可以直接：
- 浏览首页和全部菜单
- 查看菜品详情
- 使用 AI 推荐功能

**厨师需要登录**，可以：
- 进入后台管理页面
- 新增、编辑、删除菜品
- 上传菜品图片
- 管理食材和标签

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥

XIAOMI_MIMO_BASE_URL=https://token-plan-ams.xiaomimimo.com/v1
XIAOMI_MIMO_API_KEY=你的小米MiMo API密钥
XIAOMI_MIMO_MODEL=mimo-v2.5

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行以下文件：
- `supabase/migrations/20260503025050_init.sql` - 表结构和 RLS 策略
- `supabase/seed.sql` - 示例数据

或使用 Supabase CLI：

```bash
npx supabase link --project-ref 你的项目ID
npx supabase db push --linked
npx supabase db query --file supabase/seed.sql --linked
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
ai-kitchen-menu/
├── app/
│   ├── page.tsx              # 首页
│   ├── menu/                 # 公开菜单页
│   ├── recommend/            # AI 推荐页
│   ├── login/                # 厨师登录页
│   ├── admin/                # 后台管理页
│   └── api/recommend/        # AI 推荐 API
├── components/               # UI 组件
├── lib/
│   ├── ai/                   # AI 推荐逻辑
│   ├── dishes/               # 菜品查询和打分
│   └── supabase/             # Supabase 客户端
└── supabase/                 # 数据库迁移和种子数据
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### Supabase 配置

1. 创建 Supabase 项目
2. 执行数据库迁移
3. 创建 Storage bucket `dish-images`
4. 创建厨师账号并设置 `role = 'chef'`

## License

MIT
