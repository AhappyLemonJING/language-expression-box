const { detailPhrases } = require("../../data.js");

Page({
  data: {
    activeTab: "favorite",
    favoriteList: [],
    createdList: [],
  },

  onShow() {
    this.refreshLists();
  },

  refreshLists() {
    const favoriteIds = wx.getStorageSync("favoritePhrases") || [];
    const favoriteList = favoriteIds
      .map((id) => detailPhrases[id])
      .filter(Boolean);
    const createdList = wx.getStorageSync("createdPhrases") || [];
    this.setData({ favoriteList, createdList });
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onDetailTap(e) {
    wx.navigateTo({ url: `/pages/detail/index?id=${e.currentTarget.dataset.id}` });
  },

  onCreateTap() {
    wx.navigateTo({ url: "/pages/create/index" });
  },

  onDeleteTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    const createdList = this.data.createdList.slice();
    createdList.splice(index, 1);
    wx.setStorageSync("createdPhrases", createdList);
    this.setData({ createdList });
    wx.showToast({ title: "已删除", icon: "none" });
  },
});
