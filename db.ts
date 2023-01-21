import { DataSource } from "typeorm";
import { Job } from "./models/job";
import { Search } from "./models/search";

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  username: "root",
  password: "",
  database: "guichetemplois",
  port: 3306,

  synchronize: true,
  logging: true,

  subscribers: [],
  migrations: [],
  entities: [Job, Search],
});
export default AppDataSource;
