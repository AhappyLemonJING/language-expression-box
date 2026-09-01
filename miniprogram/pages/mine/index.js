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

  onPublishTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const item = this.data.createdList.find((phrase) => phrase.id === id);
    if (!item) return;

    const shouldPublish = item.status !== "published";
    const action = shouldPublish ? api.publishMyPhrase : api.unpublishMyPhrase;
    wx.showLoading({ title: shouldPublish ? "发布中" : "处理中" });
    action(id)
      .then((result) => {
        wx.hideLoading();
        wx.showToast({
          title: shouldPublish ? "已发布" : "已取消发布",
          icon: "none",
        });
        const createdList = this.data.createdList.map((phrase) => {
          if (phrase.id !== id) return phrase;
          return Object.assign({}, phrase, {
            status: result.status,
            published: result.status === "published",
            canPublish: result.status === "active",
            canUnpublish: result.status === "published",
          });
        });
        this.setData({ createdList });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || "操作失败", icon: "none" });
      });
  },
});
