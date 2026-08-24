const { ledgerRecords } = require("../../data.js");

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
    const stored = wx.getStorageSync("ledgerRecords") || [];
    const records = stored.length ? stored : ledgerRecords;
    const decorated = records.map((item) => ({
      ...item,
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
    const id = Number(e.currentTarget.dataset.id);
    const records = this.data.records.map((item) => {
      if (item.id === id) {
        return { ...item, status: "已闭环", statusClass: "closed" };
      }
      return item;
    });
    wx.setStorageSync("ledgerRecords", records);
    this.setData({ records, showSparkle: true });
    setTimeout(() => {
      this.setData({ showSparkle: false });
      this.applyFilter(this.data.activeFilter);
    }, 900);
  },
});
