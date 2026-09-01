# 话术盒子 · 微信小程序

全场景万能话术工具箱，覆盖职场、社交、人情、拒绝、维权、情感沟通。前端为微信小程序，后端使用微信云开发，通过云函数和云数据库保存话术、分类、收藏、自建话术和沟通台账。

## 运行方式

1. 在微信开发者工具中开通云开发，并创建环境。
2. 在 `miniprogram/config.js` 填入云环境 ID；只有一个默认环境时也可以留空。
3. 右键 `cloudfunctions/initData` 和 `cloudfunctions/api`，分别选择“上传并部署：云端安装依赖”。
4. 在云开发控制台运行 `initData` 云函数，它会创建集合并导入官方分类和话术。
5. 打开微信开发者工具，编译小程序。

## 目录结构

- `cloudfunctions/api`：云函数 CRUD 接口
- `cloudfunctions/initData`：云数据库初始化函数
- `scripts/generate-cloud-seed.js`：从 `data.js` 生成云开发种子数据
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

## 云函数接口

前端通过 `wx.cloud.callFunction({ name: "api" })` 调用，所有接口共用 `action` 参数：

- `login`：登录并初始化用户
- `getCategories`：分类列表
- `getPhrases`：公开话术列表（官方模板 + 已发布的自建话术），支持 `scene`、`categoryId`、`keyword`、分页
- `getPhraseDetail`：话术详情
- `getMyPhrases`、`createMyPhrase`、`updateMyPhrase`、`deleteMyPhrase`：自建话术 CRUD
- `publishMyPhrase`、`unpublishMyPhrase`：发布 / 取消发布自建话术，发布后可在首页的最近上新中被其他用户看到
- `getFavorites`、`addFavorite`、`removeFavorite`：收藏
- `getLedger`、`createLedger`、`getLedgerDetail`、`updateLedger`、`closeLedger`、`deleteLedger`：沟通台账

## 视觉规范

- 主色：薰衣草紫 `#8B6FE8`
- 深色文字：墨紫 `#3E345A`
- 背景：奶油白 `#FEFCF8`
- 警示：珊瑚粉 `#EF7F72`
- 提醒：奶油金 `#F2C46D`
- 成功：薄荷绿 `#43B98F`
- 圆角：卡片 32rpx，输入框 / 按钮 26-28rpx，胶囊标签使用全圆角

## 已实现交互

- 下拉刷新话小泡蹦跳动画
- 一键复制成功话小泡庆祝弹窗 + 星光粒子
- 收藏星星弹跳动画（服务端持久化）
- 台账标记闭环礼花反馈
- AI 润色思考中加载态
- 新建话术自动识别 `${变量}`
- 详情页 `${变量}` 浅紫泡泡高亮与一键填充生成
