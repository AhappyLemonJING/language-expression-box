const api = require("../../services/api");

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
    Promise.all([api.getFavorites(), api.getMyPhrases()])
      .then((results) => {
        const favoriteList = results[0];
        const createdList = results[1];
        this.setData({ favoriteList, createdList });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
      });
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
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    api
      .deleteMyPhrase(id)
      .then(() => {
        wx.showToast({ title: "已删除", icon: "none" });
        this.refreshLists();
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "删除失败", icon: "none" });
      });
  },
});
