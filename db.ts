import { DataSource } from "typeorm";
import { Job } from "./models/job";
import { Search } from "./models/search";
import * as dotenv from "dotenv";

dotenv.config({});

const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as any,
  host: process.env.TYPEORM_HOST as any,
  port: process.env.TYPEORM_PORT as any,
  username: process.env.TYPEORM_USERNAME as any,
  password: process.env.TYPEORM_PASSWORD as any,
  database: process.env.TYPEORM_DATABASE as any,

  synchronize: true,
  logging: true,

  subscribers: [],
  migrations: [],
  entities: [Job, Search],
} as any);
export default AppDataSource;
