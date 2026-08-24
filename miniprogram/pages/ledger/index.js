const api = require("../../services/api");

const statusClassMap = {
  待跟进: "pending",
  已闭环: "closed",
  已超时: "overdue",
};

Page({
  data: {
    filters: ["全部", "待跟进", "已闭环", "已超时"],
    activeFilter: "全部",
    records: [],
    filteredRecords: [],
    stats: {
      all: 0,
      pending: 0,
      closed: 0,
    },
    showSparkle: false,
  },

  onShow() {
    this.refreshRecords();
  },

  refreshRecords() {
    api
      .getLedger()
      .then((records) => {
        const decorated = records.map((item) => Object.assign({}, item, {
          statusClass: statusClassMap[item.status] || "pending",
          initial: (item.contact || "未").slice(0, 1),
        }));
        this.setData({
          records: decorated,
          stats: {
            all: decorated.length,
            pending: decorated.filter((item) => item.status === "待跟进").length,
            closed: decorated.filter((item) => item.status === "已闭环").length,
          },
        });
        this.applyFilter(this.data.activeFilter);
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
      });
  },

  applyFilter(filter) {
    const filteredRecords =
      filter === "全部"
        ? this.data.records
        : this.data.records.filter((item) => item.status === filter);
    this.setData({ filteredRecords });
  },

  onFilterTap(e) {
    const activeFilter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter });
    this.applyFilter(activeFilter);
  },

  onDetailTap(e) {
    wx.navigateTo({ url: `/pages/ledger-detail/index?id=${e.currentTarget.dataset.id}` });
  },

  onEditTap(e) {
    wx.navigateTo({ url: `/pages/ledger-detail/index?id=${e.currentTarget.dataset.id}` });
  },

  onCloseTap(e) {
    const id = e.currentTarget.dataset.id;
    api
      .closeLedger(id)
      .then(() => {
        this.setData({ showSparkle: true });
        setTimeout(() => {
          this.setData({ showSparkle: false });
          this.refreshRecords();
        }, 900);
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "操作失败", icon: "none" });
      });
  },
});
