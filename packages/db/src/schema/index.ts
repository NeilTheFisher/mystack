import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";

export const cache = mysqlTable("cache", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  expiration: int("expiration").notNull(),
});

export async function initializeSchema(databaseUrl: string) {
  const connection = await mysql.createConnection(databaseUrl);

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cache (
        \`key\` VARCHAR(255) NOT NULL,
        \`value\` TEXT NOT NULL,
        \`expiration\` INT NOT NULL,
        PRIMARY KEY (\`key\`)
      )
    `);
  } finally {
    await connection.end();
  }
}
