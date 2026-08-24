const hotPhrases = [
  {
    id: "refuse-money",
    title: "拒绝朋友借钱",
    preview: "我最近手头也比较紧，房贷和孩子的费用刚排完，实在匀不出来。",
    tag: "拒绝话术",
  },
  {
    id: "wedding-toast",
    title: "婚礼敬酒词",
    preview: "祝你们日子像这杯酒一样，越品越甜，往后年年有今日。",
    tag: "送礼祝福",
  },
  {
    id: "delay-notice",
    title: "项目延期通知",
    preview: "很抱歉同步一个进展：本周联调遇到阻塞，预计延期三个工作日。",
    tag: "职场沟通",
  },
  {
    id: "after-sale",
    title: "售后维权开场",
    preview: "你好，我于上周购买的商品出现质量问题，需要申请退换处理。",
    tag: "售后维权",
  },
];

const riskPhrases = [
  {
    id: "refuse-work",
    title: "拒绝同事甩活",
    preview: "我手上已经排满三个需求，这个任务需要你重新找负责人。",
    tag: "拒绝话术",
    risk: "高风险",
  },
  {
    id: "salary-talk",
    title: "涨薪沟通",
    preview: "这半年我交付的项目均按时上线，希望重新讨论一下薪资。",
    tag: "职场沟通",
    risk: "高风险",
  },
  {
    id: "conflict-close",
    title: "关系紧张时破冰",
    preview: "上次的沟通我也有没表达清楚的地方，想和你认真聊聊。",
    tag: "人情社交",
    risk: "中等",
  },
  {
    id: "refund-fight",
    title: "客服推诿应对",
    preview: "请记录工单编号并给出处理时限，我会保留本次沟通记录。",
    tag: "售后维权",
    risk: "中等",
  },
];

const newPhrases = [
  {
    id: "apology-boss",
    title: "工作失误道歉",
    preview: "这次的失误责任在我，我已经列出补救方案，稍后同步给您。",
    tag: "道歉致歉",
  },
  {
    id: "gift-thanks",
    title: "收到礼物感谢",
    preview: "礼物我收到了，特别合心意，你费心了，改天请你吃饭。",
    tag: "人情社交",
  },
  {
    id: "blind-date",
    title: "相亲开场白",
    preview: "你好呀，我是某某介绍的小周，很高兴认识你。",
    tag: "相亲社交",
  },
  {
    id: "teacher-chat",
    title: "家长会沟通",
    preview: "老师您好，孩子最近在家状态不错，想听听您的观察和建议。",
    tag: "学生校园",
  },
];

const detailPhrases = {
  "refuse-money": {
    id: "refuse-money",
    title: "拒绝朋友借钱",
    scenario: "拒绝话术",
    risk: "高风险",
    tip: "先表达理解，再给具体理由，不要只说“不方便”。把还款或帮助的边界说清楚，能避免后续反复拉扯。",
    variables: [
      { key: "称呼", value: "" },
      { key: "金额", value: "" },
    ],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${称呼}，我理解你现在需要用钱。不过我这边最近也有房贷和日常开销要安排，实在匀不出${金额}。虽然这次帮不上忙，但如果你需要一起想想其他办法，我可以陪你聊聊。",
      },
      {
        name: "客观中立版",
        icon: "📝",
        content: "${称呼}，你提到的${金额}我确实拿不出来。我的资金已经做了安排，近期没有可动用的余量，希望你能理解。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "${称呼}，最近我手头也紧，${金额}这边帮不上忙，不好意思呀。",
      },
      {
        name: "正式邮件版",
        icon: "📩",
        content: "尊敬的${称呼}：非常理解您目前的需要。受个人资金安排限制，我暂时无法提供${金额}的借款，感谢您的理解。",
      },
    ],
  },
  "wedding-toast": {
    id: "wedding-toast",
    title: "婚礼敬酒词",
    scenario: "送礼祝福",
    risk: "普通",
    tip: "敬酒词控制在三句话以内，先祝福新人，再落到具体的人和事，气氛会更自然。",
    variables: [{ key: "称呼", value: "" }],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${称呼}，祝你们以后的日子像今天一样甜，互相照顾，年年都开心。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "恭喜${称呼}！新婚快乐，百年好合，改天一起吃饭！",
      },
    ],
  },
  "delay-notice": {
    id: "delay-notice",
    title: "项目延期通知",
    scenario: "职场沟通",
    risk: "中等",
    tip: "延期通知要说清原因、影响和新时间点，同时给出补救动作，避免只抛问题。",
    variables: [
      { key: "对方称呼", value: "" },
      { key: "延期天数", value: "" },
    ],
    variants: [
      {
        name: "客观中立版",
        icon: "📝",
        content: "${对方称呼}，同步一下进展：本周联调遇到接口阻塞，预计整体延期${延期天数}个工作日。我们已调整排期并补充测试，具体时间表会在明天上午同步。",
      },
      {
        name: "正式邮件版",
        icon: "📩",
        content: "尊敬的${对方称呼}：受第三方接口联调影响，原计划交付日期将顺延${延期天数}个工作日。我方已启动备选方案，预计本周五前完成修复并更新交付计划。",
      },
    ],
  },
  "after-sale": {
    id: "after-sale",
    title: "售后维权开场",
    scenario: "售后维权",
    risk: "中等",
    tip: "开场先给订单号和时间，再描述问题和诉求，态度坚定但不情绪化，客服更容易推进。",
    variables: [
      { key: "订单号", value: "" },
      { key: "问题描述", value: "" },
    ],
    variants: [
      {
        name: "客观中立版",
        icon: "📝",
        content: "你好，订单${订单号}存在以下问题：${问题描述}。请帮我登记售后并告知处理方案和时限，谢谢。",
      },
      {
        name: "正式邮件版",
        icon: "📩",
        content: "贵司客服：本人订单${订单号}收到后出现${问题描述}。依据平台售后规则，现申请退换货处理，请于三个工作日内回复。",
      },
    ],
  },
  "refuse-work": {
    id: "refuse-work",
    title: "拒绝同事甩活",
    scenario: "拒绝话术",
    risk: "高风险",
    tip: "拒绝时给出客观理由，并明确由谁接手，不要模棱两可，也不要在公共群直接开火。",
    variables: [{ key: "同事称呼", value: "" }],
    variants: [
      {
        name: "客观中立版",
        icon: "📝",
        content: "${同事称呼}，我手上已经有三个并行需求，这个任务我接不了。建议你找项目经理重新排期或调整负责人，我可以帮忙补充交接说明。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "${同事称呼}，实在排不开，这个需求建议找负责人重新安排一下。",
      },
    ],
  },
  "salary-talk": {
    id: "salary-talk",
    title: "涨薪沟通",
    scenario: "职场沟通",
    risk: "高风险",
    tip: "用数据说话：列交付、对比市场、给期望区间，同时表达长期意愿，不要只谈辛苦。",
    variables: [
      { key: "期望区间", value: "" },
      { key: "核心成绩", value: "" },
    ],
    variants: [
      {
        name: "客观中立版",
        icon: "📝",
        content: "关于薪资，过去半年我完成了${核心成绩}，希望结合市场水平重新评估，我的期望区间是${期望区间}，也想听听您的反馈。",
      },
      {
        name: "正式邮件版",
        icon: "📩",
        content: "您好，近期我在${核心成绩}方面有稳定产出。结合岗位与市场情况，希望申请将薪资调整至${期望区间}，恳请安排一次沟通。",
      },
    ],
  },
  "conflict-close": {
    id: "conflict-close",
    title: "关系紧张时破冰",
    scenario: "人情社交",
    risk: "中等",
    tip: "先承认自己也有责任，再邀请对方说说感受，不要一上来就争对错。",
    variables: [{ key: "对方称呼", value: "" }],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${对方称呼}，上次的事情我也有没处理好的地方。我想认真听听你的想法，我们再好好聊一次。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "${对方称呼}，想找你聊聊上次的事，我也有做得不够好的地方，等你方便。",
      },
    ],
  },
  "refund-fight": {
    id: "refund-fight",
    title: "客服推诿应对",
    scenario: "售后维权",
    risk: "中等",
    tip: "要求工单编号、明确时限，并保留截图。遇到推诿就逐级升级，不要反复解释同一件事。",
    variables: [
      { key: "订单号", value: "" },
      { key: "诉求", value: "" },
    ],
    variants: [
      {
        name: "客观中立版",
        icon: "📝",
        content: "订单${订单号}的问题已经沟通两轮，请给出工单编号和处理时限。我的诉求是${诉求}，如今天无法解决请转上级处理。",
      },
    ],
  },
  "apology-boss": {
    id: "apology-boss",
    title: "工作失误道歉",
    scenario: "道歉致歉",
    risk: "中等",
    tip: "道歉要快、要具体，重点是补救方案和时间点，不要反复解释原因显得推责。",
    variables: [
      { key: "领导称呼", value: "" },
      { key: "补救动作", value: "" },
    ],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${领导称呼}，这次失误责任在我，很抱歉。我已经启动${补救动作}，最晚明天中午前给您一个完整结果。",
      },
      {
        name: "正式邮件版",
        icon: "📩",
        content: "您好，关于本次失误我深表歉意。当前已执行${补救动作}，并将于明日完成复核，避免同类问题再次发生。",
      },
    ],
  },
  "gift-thanks": {
    id: "gift-thanks",
    title: "收到礼物感谢",
    scenario: "人情社交",
    risk: "普通",
    tip: "感谢要具体：提到礼物细节和你的使用场景，比笼统说谢谢更有温度。",
    variables: [{ key: "称呼", value: "" }],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${称呼}，礼物我收到啦，包装和心意都很合我心意，真的很感谢你。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "${称呼}，礼物收到啦，太喜欢了，改天请你吃饭！",
      },
    ],
  },
  "blind-date": {
    id: "blind-date",
    title: "相亲开场白",
    scenario: "相亲社交",
    risk: "普通",
    tip: "开场先自我介绍，再抛一个轻松话题，避免查户口式提问。",
    variables: [{ key: "介绍人", value: "" }],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "你好呀，我是${介绍人}介绍的小周，平时喜欢散步和看展，很高兴认识你。",
      },
      {
        name: "简短微信版",
        icon: "💬",
        content: "你好，我是${介绍人}介绍的小周，很高兴认识你呀！",
      },
    ],
  },
  "teacher-chat": {
    id: "teacher-chat",
    title: "家长会沟通",
    scenario: "学生校园",
    risk: "普通",
    tip: "先表达配合意愿，再请教具体观察点，把问题变成共同协作。",
    variables: [{ key: "老师称呼", value: "" }],
    variants: [
      {
        name: "委婉温和版",
        icon: "🫂",
        content: "${老师称呼}，孩子在家状态不错，我们也很想配合学校，想听听您的观察和建议。",
      },
    ],
  },
};

const categories = [
  { id: "work", icon: "💼", name: "职场办公", desc: "汇报、沟通、项目管理", color: "#F0EAFE", accent: "#8B6FE8" },
  { id: "social", icon: "🤝", name: "人情社交", desc: "见面、寒暄、人情往来", color: "#FFF0E8", accent: "#DF7C62" },
  { id: "refuse", icon: "❌", name: "拒绝专区", desc: "借钱、甩活、不合理请求", color: "#FFEDE9", accent: "#E77B68" },
  { id: "apology", icon: "🙏", name: "道歉&安抚", desc: "认错、修复、安抚情绪", color: "#E7F6EF", accent: "#39A87F" },
  { id: "blessing", icon: "💬", name: "祝福问候", desc: "节日、喜事、日常问候", color: "#FFF3DC", accent: "#C58A22" },
  { id: "rights", icon: "🛒", name: "售后维权", desc: "退换货、投诉、协商", color: "#EEE7FD", accent: "#8068DD" },
  { id: "dating", icon: "💞", name: "情感相亲", desc: "开场、邀约、升温", color: "#FFE7EE", accent: "#D26883" },
  { id: "school", icon: "🎓", name: "学生校园", desc: "师生、家校、同学沟通", color: "#E7F6EF", accent: "#43B98F" },
  { id: "custom", icon: "✍️", name: "自定义场景", desc: "创建你的专属话术", color: "#F6EFFB", accent: "#9C8FB1" },
];

const ledgerRecords = [
  {
    id: 1,
    contact: "陈经理",
    phraseTitle: "项目延期通知",
    time: "08-23 15:20",
    status: "待跟进",
    note: "对方已收到延期说明，等明天上午确认新排期。",
  },
  {
    id: 2,
    contact: "老王",
    phraseTitle: "拒绝朋友借钱",
    time: "08-22 11:05",
    status: "已闭环",
    note: "对方表示理解，后续改约一起吃饭。",
  },
  {
    id: 3,
    contact: "售后客服 03",
    phraseTitle: "售后维权开场",
    time: "08-20 09:40",
    status: "已超时",
    note: "已登记工单 88321，超过 48 小时未回复。",
  },
  {
    id: 4,
    contact: "小雅",
    phraseTitle: "相亲开场白",
    time: "08-18 20:12",
    status: "待跟进",
    note: "聊得不错，约了下周三晚饭。",
  },
];

const categoriesById = (() => {
  const map = {};
  categories.forEach((c) => {
    map[c.id] = c;
  });
  return map;
})();

module.exports = {
  hotPhrases,
  riskPhrases,
  newPhrases,
  detailPhrases,
  categories,
  categoriesById,
  ledgerRecords,
};
