const cloud = require("wx-server-sdk");
const seed = require("./seed-data.json");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const collections = [
    "users",
    "categories",
    "phrases",
    "user_phrases",
    "favorites",
    "likes",
    "ledger_records",
  ];

  for (const name of collections) {
    try {
      await db.createCollection(name);
    } catch (error) {
      // 集合已存在时忽略错误，继续初始化数据
    }
  }

  const categoryCollection = db.collection("categories");
  const phraseCollection = db.collection("phrases");

  const categoryTasks = seed.categories.map((item) => {
    const { _id, ...data } = item;
    return categoryCollection.doc(_id).set({ data });
  });

  const phraseTasks = seed.phrases.map((item) => {
    const { _id, ...data } = item;
    return phraseCollection.doc(_id).set({ data });
  });

  await Promise.all([...categoryTasks, ...phraseTasks]);

  return {
    ok: true,
    collections: collections.length,
    categories: seed.categories.length,
    phrases: seed.phrases.length,
  };
};
