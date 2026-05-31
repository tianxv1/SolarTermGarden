# 节气花园 - 微信小游戏

节气花园是一款围绕中国传统 24 节气、种植养成、宠物互动和轻社交设计的微信小游戏。

项目采用 `Canvas 2D` 直接绘制界面，结合微信云开发、云函数和 DeepSeek AI，构建了花园经营、宠物养成、节气科普、社区互动和休闲竞技等玩法。

## 项目亮点

- 竖屏 Canvas 小游戏，主入口由 `game.js` 和 `js/main.js` 驱动
- 花园经营、种子商店、宠物养成、节气手账、病虫害防治、社区、竞技等模块一体化
- 宠物 AI 聊天接入 DeepSeek，支持角色化回复和上下文记忆
- 内置每日任务、随机事件、音效管理和资源预加载
- 数据、云函数和素材分层清晰，方便继续扩展新作物、新节气和新玩法
- **状态管理**：基于 EventEmitter 的 store，支持状态变更监听和历史追踪
- **离线收益**：支持最长24小时离线计算，上线自动结算作物成长
- **本地缓存**：数据先写本地后同步云端，支持离线游玩
- **异常降级**：云函数/AI 不可用时自动 fallback，保障基础功能
- **新手引导**：首次进入时分步引导，快速了解游戏玩法
- **社交防刷**：频率限制和敏感词过滤，保障社区健康
- **性能优化**：图片懒加载、音效格式规范，提升加载速度
- **多语言预留**：支持简体中文、繁体中文、英文、日文

## 核心玩法

### 花园经营

- 支持播种、浇水、施肥、收获
- 结合节气推荐合适种子
- 支持乌鸦袭击等守护事件
- 金币可用于购买种子和解锁更多内容

### 种子商店

- 按季节和节气展示种子
- 支持金币购买
- 会根据当前节气给出种植提示和加成说明

### 宠物养成

- 支持猫、狗、猫头鹰三种宠物
- 管理饥饿度、精力值、亲密度和等级
- 支持喂养、改名、互动和守护花园

### 宠物 AI 聊天

- 通过云函数 `chatWithPet` 调用 DeepSeek
- 支持上下文历史和宠物人格化回复
- 可根据当前节气和花园状态生成对话

### 节气手账 / 百科

- 24 节气知识与农事建议
- 植物百科、种植指南和收藏奖励
- 病虫害知识、防治答题和治疗建议

### 社区互动

- 发布种植心得和图文帖子
- 点赞、评论、分享
- 帖子详情与个人动态管理

### 休闲竞技

- 连连看
- 偷菜拔河
- 对局结算后可获得金币奖励

### 每日任务与随机事件

- 每日任务覆盖浇水、收获、聊天、互动、种植和施肥
- 随机事件包含阳光、降雨、神秘访客和好运奖励等

## 技术栈

- JavaScript
- Canvas 2D
- 微信小游戏
- 微信云开发 / CloudBase
- 云函数
- DeepSeek AI

## 项目结构

```text
.
├── game.js                    # 小游戏入口
├── game.json                  # 小游戏配置
├── js/
│   ├── config.js              # 配置文件（云环境ID等）
│   ├── main.js                # 主渲染与触摸分发
│   └── modules/
│       ├── index.js           # 模块统一入口
│       ├── audioManager.js    # 音效管理
│       ├── battle.js          # 休闲竞技
│       ├── community.js       # 社区互动
│       ├── dailyTasks.js      # 每日任务
│       ├── dataSync.js        # 本地缓存+云同步
│       ├── disease.js          # 病虫害防治
│       ├── fallback.js        # 异常降级策略
│       ├── garden.js          # 花园主页
│       ├── gardenData.js      # 花园数据
│       ├── globals.js         # 全局变量
│       ├── handbook.js        # 节气手账
│       ├── i18n.js            # 多语言支持
│       ├── imageLoader.js     # 图片加载
│       ├── offline.js         # 离线收益
│       ├── performance.js     # 性能优化
│       ├── petChat.js         # 宠物聊天
│       ├── profile.js         # 个人中心
│       ├── security.js        # 社交防刷
│       ├── seedShop.js       # 种子商店
│       ├── splash.js          # 启动页
│       ├── store.js           # 状态管理
│       ├── tutorial.js        # 新手引导
│       ├── friends.js         # 好友系统
│       ├── achievement.js     # 成就系统
│       ├── leaderboard.js     # 排行榜
│       ├── tooltip.js         # 工具提示
│       ├── seasonalEvent.js   # 季节性活动
│       ├── feedback.js        # 用户反馈
│       └── analytics.js       # 数据分析
├── cloudfunctions/
│   ├── chatWithPet/
│   ├── createPost/
│   ├── addComment/
│   ├── crowAttack/
│   └── initDatabase/
├── database/
│   ├── collections/
│   ├── db_import.json
│   └── init-data.json
├── images/
└── assets/
```

> 说明：`battleAI/` 和 `initAllCollections/` 目录目前在仓库中是空目录，可作为后续扩展位使用。

## 数据库集合

仓库中已经为云开发准备了 13 个集合的初始数据结构。

| 集合名 | 用途 |
| --- | --- |
| `users` | 用户数据 |
| `pets` | 宠物数据 |
| `crops` | 作物实例 |
| `plants` | 植物种类 |
| `diseases` | 病虫害数据 |
| `posts` | 用户帖子 |
| `comments` | 评论数据 |
| `chatHistory` | 聊天记录 |
| `battles` | 竞技记录 |
| `solarTerms` | 24 节气数据 |
| `favorites` | 收藏数据 |
| `likes` | 点赞记录 |
| `guardLogs` | 守护日志 |

可直接参考以下文件导入或初始化：

- `database/db_import.json`
- `database/init-data.json`
- `database/collections/*.json`

### 数据库集合字段说明

#### users（用户数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 用户唯一标识 |
| _openid | string | 微信 OpenID |
| nickName | string | 用户昵称 |
| avatarUrl | string | 头像 URL |
| gold | number | 金币数量 |
| medals | number | 奖章数量 |
| knowledgePoints | number | 知识积分 |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

#### pets（宠物数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 宠物唯一标识 |
| _openid | string | 所属用户 OpenID |
| type | string | 宠物类型：cat/dog/owl |
| name | string | 宠物名称 |
| hunger | number | 饱腹度 0-100 |
| energy | number | 精力值 0-100 |
| intimacy | number | 亲密度 0-100 |
| level | number | 等级 |
| exp | number | 当前经验值 |
| expToNext | number | 升级所需经验值 |
| lastFeedTime | Date | 最后喂养时间 |
| createTime | Date | 创建时间 |

#### crops（作物实例）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 作物唯一标识 |
| _openid | string | 所属用户 OpenID |
| plantId | string | 植物种类 ID |
| name | string | 植物名称 |
| type | string | 类型：flower/fruit/vegetable |
| icon | string | 图标路径 |
| plantTime | Date | 种植时间 |
| growTime | number | 生长时间（小时） |
| health | number | 健康度 0-100 |
| status | string | 状态：growing/harvestable/withered |
| position | number | 地块位置 |
| lastWaterTime | Date | 最后浇水时间 |
| sellPrice | number | 出售价格 |
| createTime | Date | 创建时间 |

#### plants（植物种类）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 植物 ID |
| name | string | 植物名称 |
| type | string | 类型：flower/fruit/vegetable |
| icon | string | 图标路径 |
| suitableSolarTerms | Array | 适合种植的节气 |
| growTime | number | 生长时间（小时） |
| price | number | 购买价格 |
| sellPrice | number | 出售价格 |
| description | string | 描述 |
| plantingGuide | Array | 种植指南 |
| pestControl | string | 病虫害防治 |
| farmingAdvice | string | 农事建议 |
| diseases | Array | 关联病虫害 ID |

#### diseases（病虫害数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 病虫害 ID |
| name | string | 病虫害名称 |
| icon | string | 图标路径 |
| symptom | string | 症状描述 |
| correctCure | string | 正确治疗方法 |
| wrongCure1 | string | 错误治疗方法1 |
| wrongCure2 | string | 错误治疗方法2 |
| knowledge | string | 科普知识 |
| affectedPlants | Array | 影响植物类型 |

#### posts（用户帖子）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 帖子 ID |
| title | string | 标题 |
| content | string | 内容 |
| images | Array | 图片 URL 列表 |
| solarTerm | string | 关联节气 |
| userId | string | 发布者 OpenID |
| userName | string | 发布者昵称 |
| userAvatar | string | 发布者头像 |
| likes | number | 点赞数 |
| comments | number | 评论数 |
| status | string | 状态：active/deleted |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

#### comments（评论数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 评论 ID |
| postId | string | 所属帖子 ID |
| content | string | 评论内容 |
| userId | string | 评论者 OpenID |
| userName | string | 评论者昵称 |
| userAvatar | string | 评论者头像 |
| createTime | Date | 创建时间 |

#### chatHistory（聊天记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 记录 ID |
| _openid | string | 用户 OpenID |
| role | string | 角色：user/assistant |
| content | string | 消息内容 |
| createTime | Date | 创建时间 |

#### battles（竞技记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 记录 ID |
| _openid | string | 用户 OpenID |
| plantId | string | 参赛植物 ID |
| plantName | string | 植物名称 |
| result | string | 结果：win/lose |
| playerProgress | number | 玩家进度 |
| aiProgress | number | AI 进度 |
| createTime | Date | 创建时间 |

#### solarTerms（24节气数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 节气 ID |
| name | string | 节气名称 |
| month | number | 月份 |
| day | number | 日期 |
| advice | string | 农事建议 |
| suitablePlants | Array | 适合种植的植物 ID |
| farmingActivities | Array | 农事活动 |

#### favorites（收藏数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 收藏 ID |
| _openid | string | 用户 OpenID |
| itemId | string | 收藏项 ID |
| type | string | 类型：plant/disease/post |
| title | string | 标题 |
| icon | string | 图标路径 |
| content | string | 内容摘要 |
| createTime | Date | 创建时间 |

#### likes（点赞记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 记录 ID |
| postId | string | 帖子 ID |
| _openid | string | 用户 OpenID |
| createTime | Date | 创建时间 |

#### guardLogs（守护日志）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 日志 ID |
| userId | string | 用户 OpenID |
| petId | string | 宠物 ID |
| result | string | 结果：success/fail |
| cropsLost | Array | 损失的作物 ID 列表 |
| createTime | Date | 创建时间 |

## 云函数

| 云函数 | 功能 |
| --- | --- |
| `chatWithPet` | 宠物 AI 对话 |
| `createPost` | 创建社区帖子 |
| `addComment` | 添加评论 |
| `crowAttack` | 乌鸦袭击事件 |
| `initDatabase` | 初始化数据库 |

### chatWithPet（宠物 AI 对话）

调用 DeepSeek AI 生成宠物回复。

**入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| petInfo | Object | 是 | 宠物信息 |
| petInfo.type | string | 是 | 宠物类型：cat/dog/owl |
| petInfo.name | string | 是 | 宠物名称 |
| petInfo.hunger | number | 是 | 饱腹度 0-100 |
| petInfo.energy | number | 是 | 精力值 0-100 |
| petInfo.intimacy | number | 是 | 亲密度 0-100 |
| petInfo.level | number | 是 | 等级 |
| gardenInfo | Object | 是 | 花园信息 |
| gardenInfo.solarTerm | string | 是 | 当前节气 |
| gardenInfo.cropCount | number | 是 | 作物数量 |
| userMessage | string | 是 | 用户消息 |
| history | Array | 否 | 聊天历史 [{role, content}] |

**出参**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功 |
| content | string | AI 回复内容 |
| error | string | 错误信息（失败时） |

**调用示例**

```js
wx.cloud.callFunction({
  name: 'chatWithPet',
  data: {
    petInfo: { type: 'cat', name: '小花', hunger: 80, energy: 60, intimacy: 30, level: 1 },
    gardenInfo: { solarTerm: '立春', cropCount: 5 },
    userMessage: '今天天气怎么样？',
    history: [{ role: 'user', content: '你好' }, { role: 'assistant', content: '喵~ 你好呀！' }]
  }
}).then(res => console.log(res.result.content))
```

### createPost（创建社区帖子）

发布种植心得帖子。

**入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 帖子标题 |
| content | string | 是 | 帖子内容 |
| images | Array\<string\> | 否 | 图片 URL 列表 |
| solarTerm | string | 否 | 关联节气 |

**出参**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功 |
| message | string | 提示信息 |
| postId | string | 帖子 ID（成功时） |

**调用示例**

```js
wx.cloud.callFunction({
  name: 'createPost',
  data: {
    title: '我的桃花种植经验',
    content: '春天到了，分享一下我的种植心得...',
    images: [],
    solarTerm: '立春'
  }
}).then(res => console.log(res.result.postId))
```

### addComment（添加评论）

评论他人帖子。

**入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| postId | string | 是 | 帖子 ID |
| content | string | 是 | 评论内容 |

**出参**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功 |
| message | string | 提示信息 |
| commentId | string | 评论 ID（成功时） |

**调用示例**

```js
wx.cloud.callFunction({
  name: 'addComment',
  data: {
    postId: 'post_xxx',
    content: '写得真好，学到了！'
  }
}).then(res => console.log(res.result.commentId))
```

### crowAttack（乌鸦袭击事件）

定时触发，处理乌鸦袭击事件。

**入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| 无 | - | - | 无需入参，自动处理所有用户 |

**出参**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功 |
| processed | number | 处理的用户数 |
| details | Array | 详细处理结果 |

**调用示例**

```js
wx.cloud.callFunction({
  name: 'crowAttack'
}).then(res => console.log(res.result))
```

### initDatabase（初始化数据库）

初始化植物、病虫害、节气等基础数据。

**入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 否 | 初始化类型：plants/diseases/solarTerms/all |

**出参**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功 |
| message | string | 提示信息 |
| inserted | number | 插入的记录数 |

**调用示例**

```js
wx.cloud.callFunction({
  name: 'initDatabase',
  data: { type: 'all' }
}).then(res => console.log(res.result))
```

## 快速开始

### 1. 导入项目

使用微信开发者工具导入该小游戏项目。

### 2. 配置云开发环境

在 `js/config.js` 中把云环境 ID 替换成你自己的环境 ID：

```js
const CONFIG = {
  cloud: {
    envId: 'your-env-id',  // 替换为你的云环境 ID
    traceUser: true
  }
}
```

### 3. 创建或导入数据库

在云开发控制台中创建上述集合，或者直接导入仓库中的数据库 JSON 资料。

### 4. 部署云函数

把 `cloudfunctions/` 下的云函数分别右键部署到云端。

### 5. 开通 AI 能力

在云开发控制台中开通 AI 扩展能力，并确保 DeepSeek 可用。

### 6. 补齐素材资源

图片素材说明见 `images/README.md`。

音效资源预期放在 `assets/audio/`，例如：

- `click.mp3`
- `water.mp3`
- `coin.mp3`
- `crow.mp3`
- `magic.mp3`
- `bgm.mp3`
- `cat.mp3`
- `dog.mp3`
- `owl.mp3`

## 素材说明

`images/` 目录下当前仓库已包含部分图标资源，例如：

- 植物：桃花、西瓜、菊花、菠菜、荷花
- 宠物：猫、狗、猫头鹰
- UI：种植、浇水、施肥、图鉴、竞技按钮
- 装饰：乌鸦、花瓣等

如果部分图片缺失，游戏会尽量使用 emoji 或 Canvas 绘制作为兜底。

## 开发说明

- 游戏是竖屏模式
- 界面主要由 Canvas 直接绘制，不依赖传统 WXML 页面
- `js/modules/` 中的模块按场景拆分，扩展新功能时建议沿用这种方式
- 宠物聊天、社区发帖和评论都依赖云函数和云数据库

## 注意事项

1. AI 聊天功能依赖云开发 AI 扩展
2. 首次使用时需要完成用户授权和云资源初始化
3. 图片和音效资源缺失时，部分界面会回退到备用表现
4. 如果你准备二次开发，建议优先确认云环境 ID、数据库集合和素材路径

## 部署检查清单

部署前请确认以下项目：

### 环境配置
- [ ] 已修改 `js/config.js` 中的云环境 ID 为实际环境
- [ ] 已开通微信云开发服务
- [ ] 已配置云函数超时时间（建议 10s 以上）

### 数据库
- [ ] 已创建 13 个集合：users、pets、crops、plants、diseases、posts、comments、chatHistory、battles、solarTerms、favorites、likes、guardLogs
- [ ] 已导入 `database/init-data.json` 初始化数据
- [ ] 或已调用 `initDatabase` 云函数初始化基础数据

### 云函数部署
- [ ] 已部署 `chatWithPet` 云函数
- [ ] 已部署 `createPost` 云函数
- [ ] 已部署 `addComment` 云函数
- [ ] 已部署 `crowAttack` 云函数
- [ ] 已部署 `initDatabase` 云函数

### AI 能力
- [ ] 已开通云开发 AI 扩展
- [ ] 已配置 DeepSeek API 密钥
- [ ] AI 对话功能测试通过

### 素材资源
- [ ] 图片素材已放置在 `images/` 目录
- [ ] 音效素材已放置在 `assets/audio/` 目录
- [ ] 缺失素材已准备备用方案

### 测试验证
- [ ] 用户登录授权正常
- [ ] 花园种植、浇水、收获流程正常
- [ ] 宠物喂养、聊天功能正常
- [ ] 社区发帖、评论功能正常
- [ ] 云函数调用无报错

## 未来规划

> ✅ 已实现功能

### 社交互动增强

| 功能 | 说明 | 状态 |
| --- | --- | --- |
| 好友系统 | 允许用户添加好友，互相访问花园 | ✅ 已实现 |
| 成就系统 | 搭建成就系统，激励玩家竞争与合作 | ✅ 已实现 |
| 排行榜 | 展示顶尖用户，激励用户争取更高排名 | ✅ 已实现 |

### 内容扩展

| 功能 | 说明 | 状态 |
| --- | --- | --- |
| 季节性活动 | 在特定节气推出专属活动，结合中国传统文化 | ✅ 已实现 |
| 工具提示系统 | 高亮显示关键按钮或对象，增强操作理解 | ✅ 已实现 |

### 用户参与度

| 功能 | 说明 | 状态 |
| --- | --- | --- |
| 用户反馈机制 | 提供反馈通道，定期收集用户意见 | ✅ 已实现 |
| 数据分析面板 | 帮助玩家看到种植习惯、成就和社交影响 | ✅ 已实现 |

### 待开发功能

| 功能 | 说明 | 优先级 |
| --- | --- | --- |
| 自定义花园 | 允许用户自定义花园装饰风格或宠物外观 | 中 |
| 教育内容 | 增加趣味性节气知识问答，提升教育意义 | 中 |
| 动态活动 | 定期推出主题活动和挑战 | 中 |
| 实时对战 | 增加实时对战模式 | 中 |
| 小组赛 | 支持多人小组赛玩法 | 中 |
| 跨服竞赛 | 允许不同服务器玩家竞技 | 低 |
| 多平台互通 | 考虑扩展到网页或其他移动端 | 低 |

### 技术优化（持续进行）

| 功能 | 说明 | 优先级 |
| --- | --- | --- |
| 云函数性能优化 | 确保高并发情况下保持流畅 | 高 |
| AI对话质量提升 | 持续优化 DeepSeek 模型，提高对话自然度 | 高 |
| UI/UX 现代化 | 引入更现代的设计风格，吸引年轻用户 | 中 |
| 离线功能增强 | 提供更多离线收益选项和趣味互动 | 中 |

### 持续迭代方向

- **社交互动**：好友系统、成就展示、排行榜激励
- **个性化**：自定义花园装饰、宠物外观、数据分析面板
- **内容丰富**：季节性活动、主题挑战、教育知识问答
- **技术打磨**：AI 对话质量、云函数性能、跨平台支持

## License

MIT
