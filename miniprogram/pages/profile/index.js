Page({
  data: {
    menus: [
      { name: "我的团队", icon: "🧑‍🤝‍🧑", color: "#F0EAFE" },
      { name: "我的提醒列表", icon: "⏰", color: "#FFF0E8" },
      { name: "话术导入导出", icon: "💾", color: "#E7F6EF" },
      { name: "系统设置", icon: "⚙️", color: "#F6EFFB" },
      { name: "使用帮助", icon: "💡", color: "#FFF3DC" },
      { name: "意见反馈", icon: "📮", color: "#FFE7EE" },
    ],
  },

  onMenuTap(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `${name}功能开发中`, icon: "none" });
  },
});
