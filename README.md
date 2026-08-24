# 话术盒子 · 微信小程序前端

全场景万能话术工具箱，覆盖职场、社交、人情、拒绝、维权、情感沟通。当前版本为纯前端原型，使用本地 mock 数据和 `wx.setStorage` 模拟收藏、自建话术、沟通台账等能力。

## 运行方式

1. 打开微信开发者工具，导入项目根目录。
2. `project.config.json` 默认使用 `touristappid` 测试 AppID；如需真机预览，请替换为自己的小程序 AppID。
3. 首次打开建议清空本地缓存，以便看到默认示例数据。

## 目录结构

- `miniprogram/pages/index`：首页（今日热门、高风险专区、最近上新）
- `miniprogram/pages/category`：话术分类大全
- `miniprogram/pages/detail`：话术详情（版本切换、变量填充、复制/AI润色）
- `miniprogram/pages/mine`：我的话术（收藏 / 自建）
- `miniprogram/pages/create`：新建话术
- `miniprogram/pages/ledger`：沟通台账列表
- `miniprogram/pages/ledger-detail`：跟进记录与回访提醒
- `miniprogram/pages/profile`：我的
- `miniprogram/data.js`：示例话术、分类、台账数据
- `miniprogram/images/huaxiaobao`：话小泡表情与空状态插画
- `miniprogram/images/tab`：底部导航手绘图标

## 视觉规范

- 主色：薰衣草紫 `#9B86F5`
- 警示：活力浅橙 `#FFB870`
- 成功：薄荷绿 `#7CD9AF`
- 社交：樱花粉 `#FFB8CB`
- 背景：奶油米白 `#FFFDF8`
- 圆角：卡片 / 输入框 / 标签 / 按钮统一 36rpx（18px）

## 已实现交互

- 下拉刷新话小泡蹦跳动画
- 一键复制成功话小泡庆祝弹窗 + 星光粒子
- 收藏星星弹跳动画（本地持久化）
- 台账标记闭环礼花反馈
- AI 润色思考中加载态
- 新建话术自动识别 `${变量}`
- 详情页 `${变量}` 浅紫泡泡高亮与一键填充生成
