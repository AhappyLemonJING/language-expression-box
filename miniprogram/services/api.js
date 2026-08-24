function call(action, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "api",
      data: Object.assign({ action }, data),
      success(res) {
        const result = res.result || {};
        if (result.code === 0) {
          resolve(result.data);
          return;
        }
        reject(new Error(result.message || "请求失败"));
      },
      fail(error) {
        reject(new Error((error && error.errMsg) || "云函数调用失败"));
      },
    });
  });
}

module.exports = {
  getCategories: () => call("getCategories"),
  getPhrases: (params = {}) => call("getPhrases", params),
  getPhraseDetail: (id) => call("getPhraseDetail", { id }),
  getMyPhrases: () => call("getMyPhrases"),
  createMyPhrase: (data) => call("createMyPhrase", data),
  updateMyPhrase: (id, data) => call("updateMyPhrase", Object.assign({ id }, data)),
  deleteMyPhrase: (id) => call("deleteMyPhrase", { id }),
  getFavorites: () => call("getFavorites"),
  addFavorite: (targetType, targetId) => call("addFavorite", { targetType, targetId }),
  removeFavorite: (targetType, targetId) => call("removeFavorite", { targetType, targetId }),
  getLedger: (params = {}) => call("getLedger", params),
  createLedger: (data) => call("createLedger", data),
  getLedgerDetail: (id) => call("getLedgerDetail", { id }),
  updateLedger: (id, data) => call("updateLedger", Object.assign({ id }, data)),
  closeLedger: (id) => call("closeLedger", { id }),
  deleteLedger: (id) => call("deleteLedger", { id }),
};
