const api = require("../../services/api");

const scenarios = [
  "职场沟通",
  "人情社交",
  "拒绝话术",
  "道歉致歉",
  "送礼祝福",
  "售后维权",
  "相亲社交",
  "学生校园",
];

function detectVariables(content) {
  const matches = String(content).match(/\$\{([^}]+)\}/g) || [];
  return Array.from(new Set(matches.map((item) => item.slice(2, -1))));
}

Page({
  data: {
    scenarios,
    scenarioIndex: 0,
    form: {
      title: "",
      scenario: "",
      content: "",
      tip: "",
    },
    variables: [],
    contentLength: 0,
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`form.${key}`]: e.detail.value,
    });
  },

  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      "form.content": content,
      contentLength: content.length,
      variables: detectVariables(content),
    });
  },

  onScenarioChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      scenarioIndex: index,
      "form.scenario": scenarios[index],
    });
  },

  onSaveTap() {
    const form = this.data.form;
    if (!form.title.trim() || !form.content.trim()) {
      wx.showToast({ title: "请填写标题和正文", icon: "none" });
      return;
    }
    wx.showLoading({ title: "保存中" });
    api
      .createMyPhrase({
        title: form.title.trim(),
        categoryId: "custom",
        content: form.content.trim(),
        tip: form.tip.trim(),
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: "保存成功",
          icon: "success",
          success: () => {
            setTimeout(() => {
              wx.navigateBack();
            }, 600);
          },
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || "保存失败", icon: "none" });
      });
  },
});
