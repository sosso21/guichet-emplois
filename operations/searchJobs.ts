import { Job } from "models/job";
import { Search } from "models/search";
import puppeteer from "puppeteer";

const searchJobs = async () => {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS_BROWSER == "true",
  }); // default is true

  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const searchResults = await Search.find({
    where: {
      active: true,
    },
  });

  for (let index = 0; index < searchResults.length; index++) {
    const search = searchResults[index];

    const name = (search.q || "").split(" ").join("+");
    const place = (search.place || "").split(" ").join("+");

    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    console.time("search about" + search.q);
    await page
      .goto(
        `https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois?searchstring=${name}&locationstring=${place}`,
        {
          waitUntil: "networkidle0",
        }
      )
      .catch((err) => console.log("error loading url", err));
    console.timeEnd("search about" + search.q);
    try {
      let morePage = 8;
      while (morePage > 0) {
        morePage--;
        await page.waitForSelector("#moreresultbutton:not([disabled])");
        await page.click("#moreresultbutton:not([disabled])");
      }
    } catch {
      console.log("there no more jobs");
    }

    let links = await page.$$("article>a");

    for (let i = 0; i < links.length; i++) {
      const dateHtml = await links[i].$(".date");
      const dateFr = await page.evaluate((el) => el.textContent, dateHtml);
      const dateArray = dateFr
        .split("\n")
        .join("")
        .split("\t")
        .join("")
        .split(" ");
      const monthFr = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];
      dateArray[1] = monthFr.indexOf(dateArray[1]) + 1;
      const date = dateArray.reverse().join("-");

      /// title

      const title = await links[i].$("h3 .noctitle");
      const titleJob = await page.evaluate((el) => el.textContent, title);

      // == business
      const businessHtml = await links[i].$(".business");
      const business = await page.evaluate(
        (el) => el.textContent,
        businessHtml
      );

      // == location
      const locationHtml = await links[i].$(".location");
      const location = await page.evaluate(
        (el) => el.textContent,
        locationHtml
      );
      const addr = location
        .split("\n")
        .join("")
        .split("\t")
        .join("")
        .split("Emplacement")
        .join("")
        .trim();

      console.log("location is: " + addr);

      // == salary
      const salaryHtml = await links[i].$(".salary");
      const salary = await page.evaluate((el) => el.textContent, salaryHtml);
      const salary_hour = salary
        .split("\n")
        .join("")
        .split("\t")
        .join("")
        .split(" Salaire :")
        .join("")
        .split("$")[0]
        .trim();

      const id = await page.evaluate((item) => {
        const linkRegex = item
          .getAttribute("href")
          .match("/rechercheemplois/offredemploi/[0-9]+");

        if (!!linkRegex && !!linkRegex.length) {
          const link = linkRegex[0];
          const id = link.split("/rechercheemplois/offredemploi/").join("");

          if (!!id) {
            return +id;
          }
        }
      }, links[i]);
      if (!!id) {
        try {
          const job = new Job();

          job.id_in_website = id;
          job.title = titleJob.split("\n")[0].trim();
          job.is_validate = titleJob.includes("Vérifié");
          job.published_at = date.trim();
          job.salary_hour = salary_hour;
          job.is_negotiable = salary.includes("à négocier");
          job.employer_name = business.trim();
          job.search = search.id;
          job.place = addr;

          const insertion = await job.save();
          console.log("insertion:", insertion);
        } catch (e) {
          console.log("e:", e);
        }
      }
    }
  }
  await browser.close();
};

export default searchJobs;
