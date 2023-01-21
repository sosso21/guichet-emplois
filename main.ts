import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import "reflect-metadata";
import AppDataSource from "./db";
import searchJobs from "operations/searchJobs";

(async () => {
  dotenv.config({});

  try {
    await AppDataSource.initialize();
  } catch (e) {
    console.log("Error :", e);
  }

  await searchJobs();
})();
