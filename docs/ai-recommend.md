# AI 推荐功能技术文档

## 概述

AI 推荐功能是本项目的核心功能之一。当用户不知道想吃什么时，可以输入自然语言描述（如"我想吃辣一点、下饭的，家里有鸡蛋和土豆，不想吃肉"），AI 会根据数据库里已有的真实菜品，推荐最适合的几道菜。

**核心原则：AI 只能推荐数据库中真实存在的菜品，不允许编造菜品。**

---

## 技术栈

| 组件 | 技术 |
|------|------|
| AI SDK | Vercel AI SDK v6 |
| Provider | `@ai-sdk/openai-compatible` |
| 模型 | 小米 MiMo-V2.5 |
| Schema 验证 | Zod |
| 数据库 | Supabase Postgres |

---

## 架构流程

```
用户输入自然语言
       ↓
┌─────────────────────────────────────┐
│  Step 1: AI 偏好解析                 │
│  - 从自然语言提取结构化偏好           │
│  - 输出 UserPreference JSON          │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│  Step 2: 本地打分筛选                │
│  - 从数据库获取所有可用菜品           │
│  - 根据偏好进行本地打分               │
│  - 筛选出 Top 8 候选菜品             │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│  Step 3: AI 推荐排序                 │
│  - 将候选菜品传给 AI                 │
│  - AI 选择最合适的 3-5 道             │
│  - AI 生成推荐理由                   │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│  Step 4: 安全校验                    │
│  - 验证 AI 输出的 dishId 是否合法     │
│  - 用 dishId 匹配真实菜品数据         │
│  - 返回最终推荐结果                   │
└─────────────────────────────────────┘
```

---

## Step 1: AI 偏好解析

### 目的

从用户的自然语言描述中提取结构化的偏好信息。

### System Prompt

```
你是一个菜品偏好解析助手。
你的任务是从用户自然语言中提取偏好，输出 JSON。

必须输出以下格式的 JSON（不要输出其他内容）：
{
  "flavors": ["想吃的风味，如辣、酸、甜"],
  "availableIngredients": ["家里有的食材"],
  "avoidIngredients": ["忌口食材"],
  "avoidStyles": ["不喜欢的风格"],
  "maxCookingTime": null或数字（分钟）,
  "preferredSpiceLevel": null或0到5的数字,
  "peopleCount": null或数字,
  "mood": null或字符串
}

规则：
- 不要编造用户没有表达的信息
- 如果不确定，使用空数组或 null
- 只输出 JSON，不要输出其他内容
```

### User Prompt

用户输入的原始描述，例如：
```
我想吃辣一点、下饭的，家里有鸡蛋和土豆，不想吃肉，最好 40 分钟以内
```

### 预期输出格式

```json
{
  "flavors": ["辣", "下饭"],
  "availableIngredients": ["鸡蛋", "土豆"],
  "avoidIngredients": ["肉"],
  "avoidStyles": [],
  "maxCookingTime": 40,
  "preferredSpiceLevel": 3,
  "peopleCount": null,
  "mood": null
}
```

### Zod Schema 定义

```typescript
export const UserPreferenceSchema = z.object({
  flavors: z.array(z.string()).default([]),
  availableIngredients: z.array(z.string()).default([]),
  avoidIngredients: z.array(z.string()).default([]),
  avoidStyles: z.array(z.string()).default([]),
  maxCookingTime: z.number().nullable().default(null),
  preferredSpiceLevel: z.number().min(0).max(5).nullable().default(null),
  peopleCount: z.number().nullable().default(null),
  mood: z.string().nullable().default(null),
});
```

### 容错处理

- 如果 AI 输出格式不正确，使用默认空偏好
- 如果 JSON 解析失败，使用 `UserPreferenceSchema.parse({})` 生成默认值

---

## Step 2: 本地打分筛选

### 目的

在将数据传给 AI 之前，先用本地算法筛选出最相关的候选菜品，减少 AI 处理的数据量。

### 打分算法

```typescript
score = ingredientScore * 0.4    // 食材匹配度（权重 40%）
      + flavorScore * 0.3        // 风味匹配度（权重 30%）
      + timeScore * 0.15         // 时间匹配度（权重 15%）
      + spiceScore * 0.15        // 辣度匹配度（权重 15%）
```

### 各维度计算

| 维度 | 计算方式 | 说明 |
|------|----------|------|
| ingredientScore | `matchedCount / availableCount` | 用户现有食材与菜品食材的匹配比例 |
| flavorScore | `matchedCount / flavorCount` | 用户期望风味与菜品标签的匹配比例 |
| timeScore | `1` 或 `1 - (diff / 60)` | 菜品烹饪时间是否在用户可接受范围内 |
| spiceScore | `1 - (diff / 5)` | 菜品辣度与用户期望辣度的接近程度 |

### 排除规则

- 如果菜品包含用户的忌口食材，直接排除（score = 0）
- 只保留 score > 0 的菜品
- 按 score 降序排列，取前 8 道

### 输出

```typescript
{
  dish: Dish,                    // 菜品完整数据
  score: number,                 // 打分 (0-100)
  matchedIngredients: string[],  // 匹配的食材
  missingIngredients: string[],  // 缺少的必需食材
  excluded: boolean              // 是否被排除
}
```

---

## Step 3: AI 推荐排序

### 目的

让 AI 从候选菜品中选择最合适的 3-5 道，并生成自然语言推荐理由。

### System Prompt

```
你是一个温柔、自然、有朋友感的 AI 私厨菜单推荐助手。

重要规则：
1. 你只能从候选菜品中推荐。
2. 你不能编造菜品。
3. 你不能输出候选菜品以外的 dishId。
4. 推荐理由必须具体说明为什么适合用户。
5. 推荐理由要结合用户现有食材、想吃的风味、忌口、烹饪时间和辣度。
6. 输出最多 5 道菜。
7. 如果匹配度一般，也要诚实说明。
8. 语气要自然，像朋友帮忙推荐，不要像外卖广告。

允许推荐的 dishId：
{allowedDishIds}

输出格式（只输出 JSON）：
{
  "recommendations": [
    {
      "dishId": "菜品ID",
      "score": 85,
      "reason": "推荐理由",
      "matchedIngredients": ["匹配的食材"],
      "missingIngredients": ["缺少的食材"]
    }
  ],
  "summary": "整体推荐总结"
}
```

### User Prompt

```
用户原始描述：
{message}

解析后的用户偏好：
{preference JSON}

候选菜品：
{candidatePayload JSON}

请从候选菜品中选择最合适的 3 到 5 道，输出 JSON。
```

### 候选菜品数据结构

```json
{
  "dishId": "uuid",
  "name": "香辣土豆牛肉",
  "description": "微辣、下饭、适合配米饭的一道家常菜。",
  "cuisine": "家常",
  "spiceLevel": 2,
  "cookingTimeMinutes": 40,
  "tags": ["下饭", "微辣", "家常"],
  "ingredients": [
    { "name": "土豆", "amount": "2个", "isRequired": true },
    { "name": "牛肉", "amount": "300g", "isRequired": true }
  ],
  "baseScore": 85,
  "matchedIngredients": ["土豆"],
  "missingIngredients": ["牛肉"]
}
```

### 预期输出格式

```json
{
  "summary": "根据你想吃辣、下饭的需求，我推荐了两道菜。香辣土豆牛肉完全符合你的要求，番茄炒蛋虽然不辣但很下饭。",
  "recommendations": [
    {
      "dishId": "uuid-1",
      "score": 92,
      "reason": "这道菜正好符合你想吃辣、下饭的要求，而且你已经有土豆了，只需要再准备牛肉。",
      "matchedIngredients": ["土豆"],
      "missingIngredients": ["牛肉"]
    },
    {
      "dishId": "uuid-2",
      "score": 75,
      "reason": "虽然这道菜不辣，但它非常下饭，而且你有鸡蛋，只需要番茄就能做。",
      "matchedIngredients": ["鸡蛋"],
      "missingIngredients": ["番茄"]
    }
  ]
}
```

### Zod Schema 定义

```typescript
export const RecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      dishId: z.string(),
      score: z.number().min(0).max(100),
      reason: z.string(),
      matchedIngredients: z.array(z.string()),
      missingIngredients: z.array(z.string()),
    })
  ),
  summary: z.string(),
});
```

---

## Step 4: 安全校验

### 目的

确保 AI 输出的 dishId 都是合法的、存在于数据库中的。

### 校验逻辑

```typescript
// 1. 获取允许的 dishId 列表
const allowedDishIds = candidatePayload.map((dish) => dish.dishId);

// 2. 过滤 AI 输出，只保留合法的 dishId
const safeRecommendations = output.recommendations.filter((item) =>
  allowedDishIds.includes(item.dishId)
);

// 3. 用 dishId 匹配真实菜品数据（不信任 AI 返回的菜名、图片等）
const recommendationsWithDish = await Promise.all(
  safeRecommendations.map(async (rec) => {
    const dish = await getDishById(rec.dishId);
    return { ...rec, dish };
  })
);
```

### 安全原则

| 原则 | 说明 |
|------|------|
| AI 不编造菜品 | 只能从候选菜品中选择 |
| AI 不输出非法 ID | dishId 必须在 allowedDishIds 中 |
| 前端不信任 AI 返回的菜品信息 | 菜名、图片、slug 必须从数据库获取 |
| AI 不执行用户输入 | 用户输入只作为文本解析，不执行任何代码 |

---

## 最终 API 返回格式

```json
{
  "summary": "我会优先推荐几道下饭、微辣、食材匹配度高的菜。",
  "recommendations": [
    {
      "dishId": "uuid",
      "dish": {
        "id": "uuid",
        "name": "香辣土豆牛肉",
        "slug": "spicy-potato-beef",
        "description": "微辣、下饭、适合配米饭的一道家常菜。",
        "image_url": "https://...",
        "cuisine": "家常",
        "spice_level": 2,
        "difficulty": "medium",
        "cooking_time_minutes": 40,
        "servings": 2,
        "dish_tags": [
          { "id": "uuid", "tag": "微辣" },
          { "id": "uuid", "tag": "下饭" }
        ],
        "dish_ingredients": []
      },
      "score": 92,
      "reason": "这道菜符合你想吃微辣、下饭的要求，而且你已经有土豆和牛肉，缺少的食材很少。",
      "matchedIngredients": ["土豆", "牛肉"],
      "missingIngredients": ["洋葱", "青椒"]
    }
  ]
}
```

---

## 文件结构

```
lib/ai/
├── xiaomi.ts       # 小米 MiMo Provider 封装
├── schemas.ts      # Zod Schema 定义
└── recommend.ts    # 推荐主逻辑

lib/dishes/
├── scoring.ts      # 本地打分算法
├── queries.ts      # 数据库查询
└── types.ts        # 类型定义

app/api/recommend/
└── route.ts        # API 路由
```

---

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| AI 偏好解析失败 | 使用默认空偏好，继续推荐 |
| 没有候选菜品 | 返回友好提示，建议换描述或添加菜品 |
| AI 推荐失败 | 返回错误信息"AI 推荐暂时失败，请稍后再试" |
| JSON 解析失败 | 返回"推荐分析完成，但结果解析失败，请重试" |
| dishId 不合法 | 过滤掉非法 ID，只返回合法推荐 |

---

## 环境变量

```env
XIAOMI_MIMO_BASE_URL=https://token-plan-ams.xiaomimimo.com/v1
XIAOMI_MIMO_API_KEY=your-api-key
XIAOMI_MIMO_MODEL=mimo-v2.5
```
