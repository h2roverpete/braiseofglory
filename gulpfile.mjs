import minimist from 'minimist';
import gulp from 'gulp';
import 'colors';
import RestAPI from './api/api.mjs'
import * as fs from "node:fs";
import 'dotenv/config';
import mustache from "mustache";

/**
 * Gulpfile for building sitemap and index.html in React public folder.
 * Import this into a stub gulpfile at your project root.
 */

const args = minimist(process.argv.slice(2));

gulp.task("buildSitemap", async function () {
  const restApi = new RestAPI(
    parseInt(process.env.REACT_APP_SITE_ID),
    process.env.REACT_APP_BACKEND_HOST,
    process.env.REACT_APP_API_KEY
  );
  const sitemap = await restApi.getSitemap();
  fs.writeFileSync(`./public/sitemap.xml`, sitemap);
  console.log(`Site map:\n\n${sitemap}`.green);
});

gulp.task("buildIndex", async function () {
  const restApi = new RestAPI(
    parseInt(process.env.REACT_APP_SITE_ID),
    process.env.REACT_APP_BACKEND_HOST,
    process.env.REACT_APP_API_KEY
  );
  const outline = await restApi.getSiteOutline();
  const template = fs.readFileSync('src/framework/index_template.html', 'utf8');
  let index;
  if (outline.length > 0) {
    const page = await restApi.getPage(outline[0].PageID);
    index = mustache.render(template, {
      ...page,
      title: page.PageMetaTitle ? page.PageMetaTitle : page.PageTitle,
    })

  } else {
    const site = await restApi.getSite();
    index = mustache.render(template, {
      title: site.SiteName,
    })
  }
  fs.writeFileSync(`./public/index.html`, index);
  console.log(`index.html generated.`.green);
});
