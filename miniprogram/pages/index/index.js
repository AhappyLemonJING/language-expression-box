const api = require("../../services/api");

const tagMeta = {
  "职场办公": { color: "#8B6FE8", bg: "#F0EAFE", icon: "💼" },
  "人情社交": { color: "#CF7A55", bg: "#FFF0E8", icon: "🤝" },
  "拒绝专区": { color: "#E77B68", bg: "#FFEDE9", icon: "🙅" },
  "道歉&安抚": { color: "#C58A22", bg: "#FFF3DC", icon: "🙏" },
  "祝福问候": { color: "#D26883", bg: "#FFE7EE", icon: "🎁" },
  "售后维权": { color: "#39A87F", bg: "#E7F6EF", icon: "🧾" },
  "情感相亲": { color: "#D26883", bg: "#FFE7EE", icon: "💬" },
  "学生校园": { color: "#39A87F", bg: "#E7F6EF", icon: "🎓" },
  "职场沟通": { color: "#8B6FE8", bg: "#F0EAFE", icon: "💼" },
  "人情往来": { color: "#CF7A55", bg: "#FFF0E8", icon: "🤝" },
  "拒绝话术": { color: "#E77B68", bg: "#FFEDE9", icon: "🙅" },
  "道歉致歉": { color: "#C58A22", bg: "#FFF3DC", icon: "🙏" },
  "送礼祝福": { color: "#D26883", bg: "#FFE7EE", icon: "🎁" },
  "售后维权": { color: "#39A87F", bg: "#E7F6EF", icon: "🧾" },
  "相亲社交": { color: "#D26883", bg: "#FFE7EE", icon: "💬" },
  "学生校园": { color: "#39A87F", bg: "#E7F6EF", icon: "🎓" },
  "人情社交": { color: "#CF7A55", bg: "#FFF0E8", icon: "🤝" },
};

function decorate(list) {
  return list.map((item) => {
    const meta = tagMeta[item.tag] || {
      color: "#8B6FE8",
      bg: "#F0EAFE",
      icon: "💬",
    };
    return Object.assign({}, item, {
      tagColor: meta.color,
      tagBgColor: meta.bg,
      riskIcon: meta.icon,
    });
  });
}

Page({
  data: {
    statusBarHeight: 20,
    navHeight: 88,
    tags: ["职场沟通", "人情往来", "拒绝话术", "道歉致歉", "送礼祝福", "售后维权", "相亲社交", "学生校园"],
    activeTag: "职场沟通",
    hotList: [],
    riskList: [],
    newList: [],
    refreshing: false,
  },

  onLoad() {
    const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const statusBarHeight = winInfo.statusBarHeight || 20;
    this.setData({
      statusBarHeight,
      navHeight: statusBarHeight + 44,
    });
    this.loadData();
  },

  loadData() {
    return Promise.all([
      api.getPhrases({ scene: "hot", pageSize: 20 }),
      api.getPhrases({ scene: "risk", pageSize: 20 }),
      api.getPhrases({ scene: "new", pageSize: 20 }),
    ])
      .then((results) => {
        const hot = results[0];
        const risk = results[1];
        const fresh = results[2];
        this.setData({
          hotList: decorate(hot.list),
          riskList: decorate(risk.list),
          newList: decorate(fresh.list),
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
      });
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadData()
      .catch(() => {})
      .then(() => {
        this.setData({ refreshing: false });
        wx.stopPullDownRefresh();
      });
  },

  onTagTap(e) {
    this.setData({ activeTag: e.currentTarget.dataset.tag });
  },

  onSearchTap() {
    wx.showModal({
      title: "搜索话术",
      content: "可在分类页按分类和关键词浏览话术。",
      showCancel: false,
      confirmText: "去分类看看",
      success: () => {
        wx.switchTab({ url: "/pages/category/index" });
      },
    });
  },

  onBellTap() {
    wx.showToast({ title: "暂无新通知", icon: "none" });
  },

  onPhraseTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  },

  onMoreTap() {
    wx.switchTab({ url: "/pages/category/index" });
  },
});
