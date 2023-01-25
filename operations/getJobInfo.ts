import { Job } from "models/job";
import puppeteer from "puppeteer";

const getJobInfo = async () => {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS_BROWSER == "true",
  }); // default is true

  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const jobs = await Job.find({
    select: ["id", "id_in_website"],
    where: {
      is_scraped: false,
    },
    //  take: 1,
  });

  for (let index = 0; index < jobs.length; index++) {
    const job = jobs[index];

    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    console.time("Job id :");
    await page
      .goto(
        `https://www.guichetemplois.gc.ca/rechercheemplois/offredemploi/${job.id_in_website}`,
        {
          waitUntil: "networkidle0",
        }
      )
      .catch((err) => console.log("error loading url", err));
    console.timeEnd("Job id :");

    try {
      await page.click("#applynowbutton");

      await page.waitForSelector("#howtoapply>p>a", {
        timeout: 5000,
      });

      job["email"] = await page.$eval("#howtoapply>p>a", (link) => {
        const email = link.getAttribute("href").split("mailto:").join("");
        return email.includes("@") ? email : null;
      });
    } catch (err) {
      console.log("there are no email . \n err:", err);
    }

    try {
      const mean_salary_hour = await page.evaluate(
        (el) => +el.textContent.split("$")[0].trim().split(",").join("."),
        await page.$("dl>dd>a")
      );
      if (!!mean_salary_hour && !isNaN(mean_salary_hour)) {
        job["mean_salary_hour"] = mean_salary_hour;
      }
    } catch (err) {
      console.log("there are no mean salary \n  err:", err);
    }

    try {
      job["req_license"] = await page.evaluate(
        (el) =>
          el.textContent
            .split("\n")
            .join(" ")
            .split("\t")
            .join(" ")
            .trim()
            .includes(
              "Si vous n’êtes pas autorisé à travailler au Canada, ne postulez pas. L’employeur ne répondra pas à votre candidature"
            ),
        await page.$(".job-audience")
      );
    } catch (err) {
      console.log("there are no information about acceptations \n  err:", err);
    }

    try {
      [job["min_work_hour"], job["max_work_hour"]] = await page.evaluate(
        (el) =>
          el.textContent
            .split("heures")[0]
            .split("à")
            .map((salary) => +salary.trim()),
        await page.$('span[property="workHours"]')
      );
    } catch (err) {
      console.log("there are no information about work_hour \n  err:", err);
    }
    job["is_scraped"] = true;
    try {
      await Job.update({ id: job.id }, job);
    } catch (err) {
      console.log("some problem happen ! \n  err:", err);
    }
  }

  await browser.close();
};
export default getJobInfo;
