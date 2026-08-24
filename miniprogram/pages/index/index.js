const {
  hotPhrases,
  riskPhrases,
  newPhrases,
} = require("../../data.js");

const tagColors = ["#9B86F5", "#FF9D6C", "#5FC7A0", "#FF9DBC", "#F2B84B"];

function decorate(list) {
  return list.map((item, index) => ({
    ...item,
    tagColor: tagColors[index % tagColors.length],
  }));
}

Page({
  data: {
    statusBarHeight: 20,
    navHeight: 88,
    tags: ["职场沟通", "人情往来", "拒绝话术", "道歉致歉", "送礼祝福", "售后维权", "相亲社交", "学生校园"],
    activeTag: "职场沟通",
    hotList: decorate(hotPhrases),
    riskList: decorate(riskPhrases),
    newList: decorate(newPhrases),
    refreshing: false,
  },

  onLoad() {
    const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const statusBarHeight = winInfo.statusBarHeight || 20;
    this.setData({
      statusBarHeight,
      navHeight: statusBarHeight + 44,
    });
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    setTimeout(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
      wx.showToast({ title: "已为你更新话术", icon: "none" });
    }, 800);
  },

  onTagTap(e) {
    this.setData({ activeTag: e.currentTarget.dataset.tag });
  },

  onSearchTap() {
    wx.showModal({
      title: "搜索话术",
      content: "目前是前端原型，搜索框输入后可在分类页浏览全部场景。",
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
