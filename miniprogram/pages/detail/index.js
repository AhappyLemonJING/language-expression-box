const api = require("../../services/api");

function fillVars(content, variables) {
  let result = content;
  variables.forEach((item) => {
    const value = item.value || "____";
    result = result.split(`\${${item.key}}`).join(value);
  });
  return result;
}

Page({
  data: {
    statusBarHeight: 20,
    navHeight: 88,
    safeBottom: 0,
    phrase: {},
    variantTabs: [],
    activeVariant: 0,
    currentContent: "",
    favorite: false,
    liked: false,
    likeCount: 0,
    likeUpdating: false,
    showRemind: false,
    remindDate: "",
    remindTime: "10:00",
    generated: false,
    generatedContent: "",
    showCopy: false,
    showAiLoading: false,
    riskClass: "",
  },

  onLoad(options) {
    const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const statusBarHeight = winInfo.statusBarHeight || 20;
    this.setData({
      statusBarHeight,
      navHeight: statusBarHeight + 44,
      safeBottom: winInfo.safeArea ? Math.max(0, winInfo.screenHeight - winInfo.safeArea.bottom) : 0,
    });
    const now = new Date();
    const pad = (n) => (n < 10 ? `0${n}` : n);
    this.setData({
      remindDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    });

    this.loadPhrase(options.id || "refuse-money");
  },

  loadPhrase(id) {
    api
      .getPhraseDetail(id)
      .then((phrase) => {
        const variantTabs = phrase.variants.map((item) => ({
          name: item.name,
          icon: item.icon,
        }));
        const riskClass =
          phrase.risk === "高风险" ? "risk-high" : phrase.risk === "中等" ? "risk-mid" : "risk-low";
        this.setData(
          {
            phrase,
            variantTabs,
            riskClass,
            currentContent: phrase.variants[0] ? phrase.variants[0].content : "",
            liked: !!phrase.liked,
            likeCount: Number(phrase.likeCount || 0),
          },
          () => {
            this.loadFavorite();
          }
        );
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "话术加载失败", icon: "none" });
      });
  },

  loadFavorite() {
    if (!this.data.phrase.id) return;
    api
      .getFavorites()
      .then((favorites) => {
        this.setData({
          favorite: favorites.some((item) => item.id === this.data.phrase.id),
        });
      })
      .catch(() => {});
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: "/pages/index/index" });
      },
    });
  },

  onFavoriteTap() {
    const favorite = !this.data.favorite;
    const { id, sourceType } = this.data.phrase;
    const action = favorite ? api.addFavorite : api.removeFavorite;
    action(sourceType || "template", id)
      .then(() => {
        this.setData({ favorite });
        wx.showToast({
          title: favorite ? "已收藏" : "已取消收藏",
          icon: "none",
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "操作失败", icon: "none" });
      });
  },

  onPublishTap() {
    const phrase = this.data.phrase;
    if (!phrase.isOwner) return;
    const shouldPublish = phrase.status !== "published";
    const action = shouldPublish ? api.publishMyPhrase : api.unpublishMyPhrase;
    wx.showLoading({ title: shouldPublish ? "发布中" : "处理中" });
    action(phrase.id)
      .then((result) => {
        wx.hideLoading();
        const updatedPhrase = Object.assign({}, phrase, {
          status: result.status,
          published: result.status === "published",
          canPublish: result.status === "active",
          canUnpublish: result.status === "published",
        });
        this.setData({ phrase: updatedPhrase });
        wx.showToast({
          title: shouldPublish ? "已发布，其他人可以看到了" : "已取消发布",
          icon: "none",
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || "操作失败", icon: "none" });
      });
  },

  onLikeTap() {
    if (this.data.likeUpdating) return;
    const { id, sourceType } = this.data.phrase;
    this.setData({ likeUpdating: true });
    api
      .toggleLike(sourceType || "template", id)
      .then((result) => {
        this.setData({
          liked: !!result.liked,
          likeCount: Number(result.likeCount || 0),
          likeUpdating: false,
        });
        wx.showToast({
          title: result.liked ? "已点赞" : "已取消点赞",
          icon: "none",
        });
      })
      .catch((error) => {
        this.setData({ likeUpdating: false });
        wx.showToast({ title: error.message || "操作失败", icon: "none" });
      });
  },

  onVariantTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({
      activeVariant: index,
      currentContent: this.data.phrase.variants[index].content,
      generated: false,
      generatedContent: "",
    });
  },

  onVariableInput(e) {
    const index = Number(e.currentTarget.dataset.index);
    const variables = this.data.phrase.variables;
    variables[index].value = e.detail.value;
    this.setData({ phrase: Object.assign({}, this.data.phrase, { variables }) });
  },

  onGenerateTap() {
    const variant = this.data.phrase.variants[this.data.activeVariant];
    const content = fillVars(variant.content, this.data.phrase.variables);
    this.setData({
      generated: true,
      generatedContent: content,
    });
    wx.showToast({ title: "话术已生成", icon: "none" });
  },

  onCopyTap() {
    const variant = this.data.phrase.variants[this.data.activeVariant];
    const content = fillVars(variant.content, this.data.phrase.variables);
    wx.setClipboardData({
      data: content,
      success: () => {
        this.setData({ showCopy: true });
        setTimeout(() => {
          this.setData({ showCopy: false });
        }, 1000);
      },
    });
  },

  onRemindTap() {
    this.setData({ showRemind: true });
  },

  onRemindDateChange(e) {
    this.setData({ remindDate: e.detail.value });
  },

  onRemindTimeChange(e) {
    this.setData({ remindTime: e.detail.value });
  },

  onRemindConfirm() {
    wx.showToast({ title: "提醒已设置", icon: "success" });
    this.setData({ showRemind: false });
  },

  onRemindCancel() {
    this.setData({ showRemind: false });
  },

  onLedgerTap() {
    const record = {
      contact: "",
      phraseTitle: this.data.phrase.title,
      targetType: this.data.phrase.sourceType || "template",
      targetId: this.data.phrase.id,
      status: "待跟进",
      note: this.data.phrase.title + "，待补充沟通对象",
    };
    api
      .createLedger(record)
      .then(() => {
        wx.showToast({ title: "已加入沟通台账", icon: "none" });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加入失败", icon: "none" });
      });
  },

  onAiTap() {
    if (this.data.showAiLoading) return;
    this.setData({ showAiLoading: true });
    setTimeout(() => {
      const variant = this.data.phrase.variants[this.data.activeVariant];
      const polished = "✨ 润色版：\n" + fillVars(variant.content, this.data.phrase.variables);
      this.setData({
        showAiLoading: false,
        currentContent: polished,
      });
      wx.showToast({ title: "润色完成", icon: "none" });
    }, 900);
  },

});
