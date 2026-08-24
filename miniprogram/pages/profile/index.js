Page({
  data: {
    menus: [
      { name: "我的团队", icon: "🧑‍🤝‍🧑", color: "#E7DFFF" },
      { name: "我的提醒列表", icon: "⏰", color: "#FFE8D9" },
      { name: "话术导入导出", icon: "💾", color: "#E3F6EF" },
      { name: "系统设置", icon: "⚙️", color: "#E8E2F7" },
      { name: "使用帮助", icon: "💡", color: "#FDF3D8" },
      { name: "意见反馈", icon: "📮", color: "#FFE3EA" },
    ],
  },

  onMenuTap(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `${name}功能开发中`, icon: "none" });
  },
});
