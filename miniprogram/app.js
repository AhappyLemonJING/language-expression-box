const { CLOUD_ENV } = require("./config");

App({
  onLaunch() {
    if (wx.cloud) {
      const cloudOptions = { traceUser: true };
      if (CLOUD_ENV) cloudOptions.env = CLOUD_ENV;
      wx.cloud.init(cloudOptions);
    }
    this.globalData = {
      env: CLOUD_ENV,
    };
  },
});
