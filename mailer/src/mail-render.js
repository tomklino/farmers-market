const Vue         = require('vue');
const fs          = require('fs');
const mjml        = require('mjml');
const path        = require('path');
const vueServerRenderer = require('vue-server-renderer');

const TEMPLATES_DIR = path.join(".", "templates");

module.exports = {
  renderEmail
}

async function renderEmail(templateName, data) {
  let template = "";
  try {
    template = await loadTemplate(templateName);
  } catch(err) {
    console.log("Error while trying to load template " + templateName + ": " + err);
    throw err;
  }

  const app = new Vue({
    data,
    template
  });

  const renderer = vueServerRenderer.createRenderer();

  let renderedMJML = "";
  try {
    renderedMJML = await renderer.renderToString(app);
  } catch(err) {
    console.log("Error while trying to render vue app", err);
    throw err;
  }

  const { html } = mjml(renderedMJML);
  return html;
}

function loadTemplate(templateName) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(TEMPLATES_DIR, templateName), "utf-8", (err, data) => {
      if(err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}
