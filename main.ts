import "reflect-metadata";
import AppDataSource from "./db";
import searchJobs from "operations/searchJobs";
import getJobInfo from "operations/getJobInfo";

(async () => {
  try {
    await AppDataSource.initialize();
  } catch (e) {
    console.log("Error :", e);
  }

  await searchJobs();
  await getJobInfo();
})();
