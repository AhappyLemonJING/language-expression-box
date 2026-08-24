const fs = require("fs");
const path = require("path");
const {
  hotPhrases,
  riskPhrases,
  newPhrases,
  detailPhrases,
  categories,
} = require("../miniprogram/data.js");

const scenarioToCategoryId = {
  职场沟通: "work",
  人情社交: "social",
  拒绝话术: "refuse",
  道歉致歉: "apology",
  送礼祝福: "blessing",
  售后维权: "rights",
  相亲社交: "dating",
  学生校园: "school",
  自定义场景: "custom",
};

const hotIds = new Set(hotPhrases.map((item) => item.id));
const riskIds = new Set(riskPhrases.map((item) => item.id));
const newIds = new Set(newPhrases.map((item) => item.id));
const previews = {};
[...hotPhrases, ...riskPhrases, ...newPhrases].forEach((item) => {
  previews[item.id] = item.preview;
});

const phraseRows = Object.entries(detailPhrases).map(([id, phrase], index) => ({
  _id: id,
  title: phrase.title,
  categoryId: scenarioToCategoryId[phrase.scenario] || "custom",
  risk: phrase.risk || "普通",
  tip: phrase.tip || "",
  preview: previews[id] || phrase.variants?.[0]?.content || "",
  flags: {
    hot: hotIds.has(id),
    risk: riskIds.has(id),
    new: newIds.has(id),
  },
  variables: phrase.variables || [],
  variants: phrase.variants || [],
  sortOrder: index,
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const categoryRows = categories.map((category, index) => ({
  _id: category.id,
  name: category.name,
  desc: category.desc,
  icon: category.icon,
  color: category.color,
  accent: category.accent,
  sortOrder: index,
  status: "active",
}));

const output = {
  categories: categoryRows,
  phrases: phraseRows,
};

const target = path.join(__dirname, "..", "cloudfunctions", "initData", "seed-data.json");
fs.writeFileSync(target, JSON.stringify(output, null, 2));
console.log(`Generated ${target} with ${categoryRows.length} categories and ${phraseRows.length} phrases`);
