const { categories } = require("../../data.js");

const categoryToPhrase = {
  work: "delay-notice",
  social: "gift-thanks",
  refuse: "refuse-money",
  apology: "apology-boss",
  blessing: "wedding-toast",
  rights: "after-sale",
  dating: "blind-date",
  school: "teacher-chat",
};

Page({
  data: {
    categories,
    filteredCategories: categories,
    keyword: "",
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    const filteredCategories = categories.filter((item) => {
      return item.name.includes(keyword) || item.desc.includes(keyword);
    });
    this.setData({ keyword, filteredCategories });
  },

  onClearSearch() {
    this.setData({ keyword: "", filteredCategories: categories });
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === "custom") {
      wx.navigateTo({ url: "/pages/create/index" });
      return;
    }
    const phraseId = categoryToPhrase[id];
    if (phraseId) {
      wx.navigateTo({ url: `/pages/detail/index?id=${phraseId}` });
    } else {
      wx.showToast({ title: "该分类正在补充话术", icon: "none" });
    }
  },
});
