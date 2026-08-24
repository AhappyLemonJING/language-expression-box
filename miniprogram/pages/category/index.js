const api = require("../../services/api");

Page({
  data: {
    categories: [],
    filteredCategories: [],
    keyword: "",
  },

  onLoad() {
    this.loadCategories();
  },

  loadCategories() {
    api
      .getCategories()
      .then((categories) => {
        this.setData({ categories, filteredCategories: categories });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
      });
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    const filteredCategories = this.data.categories.filter((item) => {
      return item.name.includes(keyword) || item.desc.includes(keyword);
    });
    this.setData({ keyword, filteredCategories });
  },

  onClearSearch() {
    this.setData({ keyword: "", filteredCategories: this.data.categories });
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === "custom") {
      wx.navigateTo({ url: "/pages/create/index" });
      return;
    }
    api
      .getPhrases({ category_id: id, page: 1, pageSize: 1 })
      .then((result) => {
        const phrase = result.list[0];
        if (phrase) {
          wx.navigateTo({ url: `/pages/detail/index?id=${phrase.id}` });
        } else {
          wx.showToast({ title: "该分类正在补充话术", icon: "none" });
        }
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
      });
  },
});
