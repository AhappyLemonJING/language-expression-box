const { ledgerRecords } = require("../../data.js");

function pad(n) {
  return n < 10 ? `0${n}` : String(n);
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

Page({
  data: {
    record: null,
    feedback: "",
    reminderDate: "",
    reminderTime: "10:00",
    today: todayString(),
  },

  onLoad(options) {
    const id = Number(options.id);
    const stored = wx.getStorageSync("ledgerRecords") || [];
    const all = stored.length ? stored : ledgerRecords;
    const record = all.find((item) => item.id === id) || all[0];
    this.setData({
      record,
      feedback: record.feedback || "",
      reminderDate: todayString(),
    });
  },

  onFeedbackInput(e) {
    this.setData({ feedback: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ reminderDate: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ reminderTime: e.detail.value });
  },

  saveRecord(status) {
    const record = {
      ...this.data.record,
      feedback: this.data.feedback,
      reminder: `${this.data.reminderDate} ${this.data.reminderTime}`,
      status,
    };
    const stored = wx.getStorageSync("ledgerRecords") || [];
    const source = stored.length ? stored : ledgerRecords;
    const next = source.map((item) => (item.id === record.id ? record : item));
    wx.setStorageSync("ledgerRecords", next);
    this.setData({ record });
  },

  onSaveTap() {
    this.saveRecord(this.data.record.status || "待跟进");
    wx.showToast({ title: "跟进记录已保存", icon: "success" });
    setTimeout(() => {
      wx.navigateBack();
    }, 600);
  },

  onCloseTap() {
    this.saveRecord("已闭环");
    wx.showToast({ title: "已标记闭环", icon: "success" });
    setTimeout(() => {
      wx.navigateBack();
    }, 600);
  },
});
