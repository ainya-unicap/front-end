const platformDb =
  typeof window !== "undefined" ? require("./localDb.web") : require("./localDb.native");

export const db = platformDb.default ?? platformDb;
export const initDatabase = platformDb.initDatabase;
export default db;
