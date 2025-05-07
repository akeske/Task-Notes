import { DataSource } from "typeorm";
import Note from "../entities/Note";
import Comment from "../entities/Comment";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "notes.db",
  entities: [Note, Comment],
  synchronize: true,
  logging: false,
});
