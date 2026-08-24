const api = require("../../services/api");

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
    api
      .getLedgerDetail(id)
      .then((record) => {
        const reminderParts = String(record.reminder || "").split(" ");
        const date = reminderParts[0] || todayString();
        const time = reminderParts[1] || "10:00";
        this.setData({
          record: Object.assign({}, record, {
            initial: (record.contact || "未").slice(0, 1),
          }),
          feedback: record.feedback || "",
          reminderDate: date,
          reminderTime: time,
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "加载失败", icon: "none" });
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

  saveRecord(status, callback) {
    api
      .updateLedger(this.data.record.id, {
        feedback: this.data.feedback,
        remindAt: `${this.data.reminderDate} ${this.data.reminderTime}`,
        status,
      })
      .then(callback)
      .catch((error) => {
        wx.showToast({ title: error.message || "保存失败", icon: "none" });
      });
  },

  onSaveTap() {
    this.saveRecord(this.data.record.status || "待跟进", () => {
      wx.showToast({ title: "跟进记录已保存", icon: "success" });
      setTimeout(() => {
        wx.navigateBack();
      }, 600);
    });
  },

  onCloseTap() {
    this.saveRecord("已闭环", () => {
      wx.showToast({ title: "已标记闭环", icon: "success" });
      setTimeout(() => {
        wx.navigateBack();
      }, 600);
    });
  },
});
