const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const command = db.command;

function ok(data = null, message = "ok") {
  return { code: 0, message, data };
}

function fail(code, message) {
  return { code, message, data: null };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function nowText() {
  const value = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return value.replace(/\//g, "-");
}

function getTodayRange() {
  const now = new Date();
  const shanghaiNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const start = new Date(
    Date.UTC(shanghaiNow.getUTCFullYear(), shanghaiNow.getUTCMonth(), shanghaiNow.getUTCDate()) -
      8 * 60 * 60 * 1000
  );
  return {
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

function isCreatedToday(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  const range = getTodayRange();
  return time >= range.start.getTime() && time < range.end.getTime();
}

function likeCountOf(row) {
  return Math.max(0, Number(row.likeCount || 0));
}

function detectVariables(content) {
  const matches = String(content || "").match(/\$\{([^}]+)\}/g) || [];
  return Array.from(new Set(matches.map((item) => item.slice(2, -1)))).map((key) => ({
    key,
    value: "",
  }));
}

async function getCategoryMap() {
  const result = await db.collection("categories").where({ status: "active" }).limit(100).get();
  const map = {};
  result.data.forEach((category) => {
    map[category._id] = category.name;
  });
  return map;
}

function templateToPublic(row, categoryName) {
  return {
    id: row._id,
    title: row.title,
    scenario: categoryName || row.categoryId || "自定义场景",
    tag: categoryName || row.categoryId || "自定义场景",
    categoryId: row.categoryId || null,
    categoryName: categoryName || null,
    risk: row.risk || "普通",
    tip: row.tip || "",
    preview: row.preview || "",
    flags: row.flags || {},
    variables: row.variables || [],
    variants: row.variants || [],
    sortOrder: row.sortOrder || 0,
    likeCount: likeCountOf(row),
    status: row.status,
    sourceType: "template",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function userPhraseToPublic(row, categoryName, openid) {
  const isOwner = !!openid && row.userId === openid;
  const scenario = String(row.scenario || "").trim() || categoryName || "自定义场景";
  return {
    id: row._id,
    title: row.title,
    scenario,
    tag: scenario,
    categoryId: row.categoryId || "custom",
    categoryName: categoryName || null,
    risk: "普通",
    tip: row.tip || "",
    preview: row.content || "",
    variables: row.variables || [],
    variants: [
      {
        name: "我的版本",
        icon: "✍️",
        content: row.content || "",
      },
    ],
    likeCount: likeCountOf(row),
    sourceType: "user",
    status: row.status,
    published: row.status === "published",
    isOwner,
    canPublish: isOwner && row.status === "active",
    canUnpublish: isOwner && row.status === "published",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function ledgerToPublic(row) {
  return {
    id: row._id,
    contact: row.contact || "",
    phraseTitle: row.phraseTitle || "",
    targetType: row.targetType || null,
    targetId: row.targetId || null,
    time: row.timeAt || "",
    timeAt: row.timeAt || "",
    status: row.status || "待跟进",
    note: row.note || "",
    feedback: row.feedback || "",
    remindAt: row.remindAt || null,
    reminder: row.remindAt || "",
    closedAt: row.closedAt || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function ensureUser(openid) {
  const result = await db.collection("users").where({ openid }).limit(1).get();
  if (result.data.length) return result.data[0];
  const createdAt = nowIso();
  const user = {
    openid,
    nickname: "话术达人",
    avatarUrl: "",
    createdAt,
    updatedAt: createdAt,
  };
  const added = await db.collection("users").add({ data: user });
  return { _id: added._id, ...user };
}

async function getPhrases(event) {
  const page = Math.max(1, Number(event.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(event.pageSize) || 20));
  const scene = String(event.scene || "").trim();
  const categoryId = String(event.categoryId || event.category_id || "").trim();
  const keyword = String(event.keyword || "").trim();

  const [templateResult, userResult] = await Promise.all([
    db.collection("phrases").where({ status: "published" }).limit(100).get(),
    db.collection("user_phrases").where({ status: "published" }).limit(100).get(),
  ]);
  const categoryMap = await getCategoryMap();
  const rows = [
    ...templateResult.data.map((row) => ({
      row,
      sourceType: "template",
      phrase: templateToPublic(row, categoryMap[row.categoryId]),
    })),
    ...userResult.data.map((row) => ({
      row,
      sourceType: "user",
      phrase: userPhraseToPublic(row, categoryMap[row.categoryId]),
    })),
  ];

  if (scene === "hot") {
    const today = rows
      .filter((item) => isCreatedToday(item.row.createdAt))
      .sort(
        (a, b) =>
          likeCountOf(b.row) - likeCountOf(a.row) ||
          String(b.row.createdAt).localeCompare(String(a.row.createdAt))
      )
      .slice(0, 5);
    const todayIds = new Set(today.map((item) => item.phrase.id));
    const history = rows
      .filter((item) => !todayIds.has(item.phrase.id))
      .sort(
        (a, b) =>
          likeCountOf(b.row) - likeCountOf(a.row) ||
          (a.row.sortOrder || 0) - (b.row.sortOrder || 0) ||
          String(b.row.createdAt).localeCompare(String(a.row.createdAt))
      )
      .slice(0, 5 - today.length);
    const list = today
      .concat(history)
      .slice(0, 5)
      .map((item) => item.phrase);
    return ok({ list, total: list.length, page: 1, pageSize: list.length });
  }

  let list = rows
    .filter((item) => {
      const row = item.row;
      const phrase = item.phrase;
      if (scene === "risk" && !row.flags?.risk) return false;
      if (scene === "new" && item.sourceType !== "user" && !row.flags?.new) return false;
      if (categoryId && row.categoryId !== categoryId) return false;
      if (keyword) {
        const text = `${phrase.title} ${phrase.preview || ""} ${phrase.tag || ""}`;
        if (!text.includes(keyword)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (scene === "new") {
        const aTime = a.row.publishedAt || a.row.createdAt;
        const bTime = b.row.publishedAt || b.row.createdAt;
        return String(bTime).localeCompare(String(aTime));
      }
      const aIsTemplate = a.sourceType === "template" ? 0 : 1;
      const bIsTemplate = b.sourceType === "template" ? 0 : 1;
      if (aIsTemplate !== bIsTemplate) return aIsTemplate - bIsTemplate;
      if (a.sourceType === "template") {
        return (a.row.sortOrder || 0) - (b.row.sortOrder || 0);
      }
      return String(b.row.createdAt).localeCompare(String(a.row.createdAt));
    });

  const total = list.length;
  const start = (page - 1) * pageSize;
  list = list.slice(start, start + pageSize).map((item) => item.phrase);

  return ok({ list, total, page, pageSize });
}

async function findLike(targetType, targetId, openid) {
  const result = await db
    .collection("likes")
    .where({ userId: openid, targetType, targetId })
    .limit(1)
    .get();
  return result.data[0] || null;
}

async function getPhraseDetail(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少话术 id");
  const categoryMap = await getCategoryMap();

  try {
    const result = await db.collection("phrases").doc(id).get();
    if (result.data && result.data.status === "published") {
      const phrase = templateToPublic(result.data, categoryMap[result.data.categoryId]);
      phrase.liked = !!(await findLike("template", id, openid));
      return ok(phrase);
    }
  } catch (error) {
    // 官方模板不存在时继续查找用户自建话术
  }

  const result = await db
    .collection("user_phrases")
    .where({ _id: id })
    .limit(1)
    .get();
  if (!result.data.length) return fail(404, "话术不存在");
  const row = result.data[0];
  const isOwner = row.userId === openid;
  const visible = row.status === "published" || (isOwner && row.status !== "deleted");
  if (!visible) return fail(404, "话术不存在");
  const phrase = userPhraseToPublic(row, categoryMap[row.categoryId], openid);
  phrase.liked = !!(await findLike("user", id, openid));
  return ok(phrase);
}

async function toggleLike(event, openid) {
  const targetType = event.targetType;
  const targetId = String(event.targetId || "");
  if (!["template", "user"].includes(targetType) || !targetId) return fail(400, "点赞参数不合法");

  const collectionName = targetType === "template" ? "phrases" : "user_phrases";
  let row;
  try {
    if (targetType === "template") {
      const result = await db.collection("phrases").doc(targetId).get();
      if (!result.data || result.data.status !== "published") return fail(404, "点赞对象不存在");
      row = result.data;
    } else {
      const result = await db
        .collection("user_phrases")
        .where({ _id: targetId })
        .limit(1)
        .get();
      if (!result.data.length) return fail(404, "点赞对象不存在");
      row = result.data[0];
      const isOwner = row.userId === openid;
      if (row.status === "deleted" || !(row.status === "published" || isOwner)) {
        return fail(404, "点赞对象不存在");
      }
    }
  } catch (error) {
    return fail(404, "点赞对象不存在");
  }

  const existing = await findLike(targetType, targetId, openid);
  let liked;
  let likeCount;
  if (existing) {
    await db.collection("likes").doc(existing._id).remove();
    liked = false;
    likeCount = Math.max(0, likeCountOf(row) - 1);
  } else {
    await db.collection("likes").add({
      data: {
        userId: openid,
        targetType,
        targetId,
        createdAt: nowIso(),
      },
    });
    liked = true;
    likeCount = likeCountOf(row) + 1;
  }

  await db.collection(collectionName).doc(targetId).update({
    data: {
      likeCount,
      updatedAt: nowIso(),
    },
  });

  return ok({ targetType, targetId, liked, likeCount }, liked ? "点赞成功" : "已取消点赞");
}

async function getMyPhrases(openid) {
  const result = await db
    .collection("user_phrases")
    .where({ userId: openid, status: command.in(["active", "published"]) })
    .limit(100)
    .get();
  const categoryMap = await getCategoryMap();
  const rows = result.data
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((row) => userPhraseToPublic(row, categoryMap[row.categoryId], openid));
  return ok(rows);
}

async function createMyPhrase(event, openid) {
  const title = String(event.title || "").trim();
  const content = String(event.content || "").trim();
  const scenario = String(event.scenario || "").trim();
  if (!title || !content) return fail(400, "标题和正文不能为空");
  if (title.length > 60) return fail(400, "标题不能超过 60 字");
  if (content.length > 2000) return fail(400, "正文不能超过 2000 字");

  const id = createId("custom");
  const createdAt = nowIso();
  await db.collection("user_phrases").add({
    data: {
      _id: id,
      userId: openid,
      title,
      scenario,
      categoryId: event.categoryId || "custom",
      tip: String(event.tip || "").trim(),
      content,
      variables: detectVariables(content),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
  });
  return ok({ id }, "话术已创建");
}

async function updateMyPhrase(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少话术 id");
  const result = await db
    .collection("user_phrases")
    .where({ _id: id, userId: openid, status: command.in(["active", "published"]) })
    .limit(1)
    .get();
  const row = result.data[0];
  if (!row) return fail(404, "话术不存在");

  const title = event.title == null ? row.title : String(event.title).trim();
  const content = event.content == null ? row.content : String(event.content).trim();
  if (!title || !content) return fail(400, "标题和正文不能为空");

  await db.collection("user_phrases").doc(id).update({
    data: {
      title,
      scenario: event.scenario == null ? row.scenario : String(event.scenario).trim(),
      categoryId: event.categoryId == null ? row.categoryId : event.categoryId,
      tip: event.tip == null ? row.tip : String(event.tip).trim(),
      content,
      variables: detectVariables(content),
      updatedAt: nowIso(),
    },
  });
  return ok({ id }, "话术已更新");
}

async function deleteMyPhrase(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少话术 id");
  const result = await db
    .collection("user_phrases")
    .where({ _id: id, userId: openid, status: command.in(["active", "published"]) })
    .limit(1)
    .get();
  if (!result.data.length) return fail(404, "话术不存在");
  await db.collection("user_phrases").doc(id).update({
    data: { status: "deleted", updatedAt: nowIso() },
  });
  return ok({ id }, "话术已删除");
}

async function publishMyPhrase(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少话术 id");
  const result = await db
    .collection("user_phrases")
    .where({ _id: id, userId: openid, status: command.in(["active", "published"]) })
    .limit(1)
    .get();
  const row = result.data[0];
  if (!row) return fail(404, "话术不存在");
  if (row.status === "published") return ok({ id, status: "published" }, "话术已发布");

  await db.collection("user_phrases").doc(id).update({
    data: {
      status: "published",
      publishedAt: nowIso(),
      updatedAt: nowIso(),
    },
  });
  return ok({ id, status: "published" }, "发布成功");
}

async function unpublishMyPhrase(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少话术 id");
  const result = await db
    .collection("user_phrases")
    .where({ _id: id, userId: openid, status: command.in(["active", "published"]) })
    .limit(1)
    .get();
  const row = result.data[0];
  if (!row) return fail(404, "话术不存在");
  if (row.status === "active") return ok({ id, status: "active" }, "话术已取消发布");

  await db.collection("user_phrases").doc(id).update({
    data: {
      status: "active",
      updatedAt: nowIso(),
    },
  });
  return ok({ id, status: "active" }, "已取消发布");
}

async function getFavorites(openid) {
  const result = await db
    .collection("favorites")
    .where({ userId: openid })
    .limit(100)
    .get();
  const categoryMap = await getCategoryMap();
  const favorites = result.data
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const list = await Promise.all(
    favorites.map(async (favorite) => {
      if (favorite.targetType === "template") {
        try {
          const doc = await db.collection("phrases").doc(favorite.targetId).get();
          return doc.data && doc.data.status === "published"
            ? templateToPublic(doc.data, categoryMap[doc.data.categoryId])
            : null;
        } catch (error) {
          return null;
        }
      }
      const docs = await db
        .collection("user_phrases")
        .where({ _id: favorite.targetId })
        .limit(1)
        .get();
      const row = docs.data[0];
      if (!row) return null;
      const isOwner = row.userId === openid;
      const visible = row.status === "published" || (isOwner && row.status !== "deleted");
      return visible ? userPhraseToPublic(row, categoryMap[row.categoryId], openid) : null;
    })
  );

  return ok(list.filter(Boolean));
}

async function addFavorite(event, openid) {
  const targetType = event.targetType;
  const targetId = String(event.targetId || "");
  if (!["template", "user"].includes(targetType) || !targetId) return fail(400, "收藏参数不合法");

  if (targetType === "template") {
    try {
      const doc = await db.collection("phrases").doc(targetId).get();
      if (!doc.data || doc.data.status !== "published") return fail(404, "收藏对象不存在");
    } catch (error) {
      return fail(404, "收藏对象不存在");
    }
  } else {
    const docs = await db
      .collection("user_phrases")
      .where({ _id: targetId })
      .limit(1)
      .get();
    if (!docs.data.length) return fail(404, "收藏对象不存在");
    const row = docs.data[0];
    const isOwner = row.userId === openid;
    if (row.status === "deleted" || !(row.status === "published" || isOwner)) {
      return fail(404, "收藏对象不存在");
    }
  }

  const exists = await db
    .collection("favorites")
    .where({ userId: openid, targetType, targetId })
    .limit(1)
    .get();
  if (!exists.data.length) {
    await db.collection("favorites").add({
      data: {
        userId: openid,
        targetType,
        targetId,
        createdAt: nowIso(),
      },
    });
  }
  return ok({ targetType, targetId, favorite: true }, "已收藏");
}

async function removeFavorite(event, openid) {
  const targetType = event.targetType;
  const targetId = String(event.targetId || "");
  if (!["template", "user"].includes(targetType) || !targetId) return fail(400, "收藏参数不合法");

  const docs = await db
    .collection("favorites")
    .where({ userId: openid, targetType, targetId })
    .limit(1)
    .get();
  if (docs.data.length) {
    await db.collection("favorites").doc(docs.data[0]._id).remove();
  }
  return ok({ targetType, targetId, favorite: false }, "已取消收藏");
}

async function getLedger(event, openid) {
  const status = String(event.status || "").trim();
  const condition = {
    userId: openid,
    status: command.neq("deleted"),
  };
  const result = await db
    .collection("ledger_records")
    .where(condition)
    .limit(100)
    .get();
  let list = result.data.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  if (status) list = list.filter((item) => item.status === status);
  return ok(list.map(ledgerToPublic));
}

async function createLedger(event, openid) {
  const phraseTitle = String(event.phraseTitle || "").trim();
  if (!phraseTitle) return fail(400, "话术标题不能为空");
  const status = event.status || "待跟进";
  if (!["待跟进", "已闭环", "已超时"].includes(status)) return fail(400, "台账状态不合法");
  const createdAt = nowIso();
  const added = await db.collection("ledger_records").add({
    data: {
      userId: openid,
      contact: String(event.contact || "").trim(),
      phraseTitle,
      targetType: event.targetType || null,
      targetId: event.targetId || null,
      timeAt: event.timeAt || nowText(),
      status,
      note: String(event.note || "").trim(),
      feedback: String(event.feedback || "").trim(),
      remindAt: event.remindAt || null,
      closedAt: status === "已闭环" ? createdAt : null,
      createdAt,
      updatedAt: createdAt,
    },
  });
  const doc = await db.collection("ledger_records").doc(added._id).get();
  return ok(ledgerToPublic(doc.data), "台账已创建");
}

async function getLedgerDetail(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少台账 id");
  const result = await db
    .collection("ledger_records")
    .where({ _id: id, userId: openid, status: command.neq("deleted") })
    .limit(1)
    .get();
  const row = result.data[0];
  if (!row) return fail(404, "台账记录不存在");
  return ok(ledgerToPublic(row));
}

async function updateLedger(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少台账 id");
  const result = await db
    .collection("ledger_records")
    .where({ _id: id, userId: openid, status: command.neq("deleted") })
    .limit(1)
    .get();
  const row = result.data[0];
  if (!row) return fail(404, "台账记录不存在");

  const status = event.status || row.status;
  if (!["待跟进", "已闭环", "已超时"].includes(status)) return fail(400, "台账状态不合法");
  const data = {
    contact: event.contact == null ? row.contact : String(event.contact).trim(),
    phraseTitle: event.phraseTitle == null ? row.phraseTitle : String(event.phraseTitle).trim(),
    targetType: event.targetType === undefined ? row.targetType : event.targetType,
    targetId: event.targetId === undefined ? row.targetId : event.targetId,
    timeAt: event.timeAt || row.timeAt,
    status,
    note: event.note == null ? row.note : String(event.note).trim(),
    feedback: event.feedback == null ? row.feedback : String(event.feedback).trim(),
    remindAt: event.remindAt === undefined ? row.remindAt : event.remindAt,
    closedAt: status === "已闭环" && !row.closedAt ? nowIso() : row.closedAt,
    updatedAt: nowIso(),
  };
  await db.collection("ledger_records").doc(id).update({ data });
  return ok({ id }, "台账已更新");
}

async function closeLedger(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少台账 id");
  const result = await db
    .collection("ledger_records")
    .where({ _id: id, userId: openid, status: command.neq("deleted") })
    .limit(1)
    .get();
  if (!result.data.length) return fail(404, "台账记录不存在");
  await db.collection("ledger_records").doc(id).update({
    data: {
      status: "已闭环",
      closedAt: nowIso(),
      updatedAt: nowIso(),
    },
  });
  return ok({ id }, "已标记闭环");
}

async function deleteLedger(event, openid) {
  const id = String(event.id || "");
  if (!id) return fail(400, "缺少台账 id");
  const result = await db
    .collection("ledger_records")
    .where({ _id: id, userId: openid, status: command.neq("deleted") })
    .limit(1)
    .get();
  if (!result.data.length) return fail(404, "台账记录不存在");
  await db.collection("ledger_records").doc(id).update({
    data: { status: "deleted", updatedAt: nowIso() },
  });
  return ok({ id }, "台账已删除");
}

exports.main = async (event) => {
  const context = cloud.getWXContext();
  const openid = context.OPENID;
  if (!openid) return fail(401, "无法获取用户身份");

  const action = event.action;
  try {
    switch (action) {
      case "login":
        return ok(await ensureUser(openid), "登录成功");
      case "getCategories": {
        const result = await db.collection("categories").where({ status: "active" }).limit(100).get();
        const rows = result.data
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((category) => ({ ...category, id: category._id }));
        return ok(rows);
      }
      case "getPhrases":
        return await getPhrases(event);
      case "getPhraseDetail":
        return await getPhraseDetail(event, openid);
      case "toggleLike":
        return await toggleLike(event, openid);
      case "getMyPhrases":
        return await getMyPhrases(openid);
      case "createMyPhrase":
        return await createMyPhrase(event, openid);
      case "updateMyPhrase":
        return await updateMyPhrase(event, openid);
      case "deleteMyPhrase":
        return await deleteMyPhrase(event, openid);
      case "publishMyPhrase":
        return await publishMyPhrase(event, openid);
      case "unpublishMyPhrase":
        return await unpublishMyPhrase(event, openid);
      case "getFavorites":
        return await getFavorites(openid);
      case "addFavorite":
        return await addFavorite(event, openid);
      case "removeFavorite":
        return await removeFavorite(event, openid);
      case "getLedger":
        return await getLedger(event, openid);
      case "createLedger":
        return await createLedger(event, openid);
      case "getLedgerDetail":
        return await getLedgerDetail(event, openid);
      case "updateLedger":
        return await updateLedger(event, openid);
      case "closeLedger":
        return await closeLedger(event, openid);
      case "deleteLedger":
        return await deleteLedger(event, openid);
      default:
        return fail(404, "未知接口");
    }
  } catch (error) {
    console.error(`[${action}]`, error);
    return fail(500, error.message || "服务器内部错误");
  }
};
