const express          = require('express');

const { renderEmail }  = require('./src/mail-render');
const { sendMail }     = require('./src/sender');

// const fs               = require('fs');

const server = express();
server.use(express.json());

server.get('*', async (req, res) => {
  const { templateName, data, destination } = req.body;
  if(typeof templateName !== 'string') {
    res.status(400).send("template name must be provided");
    return;
  }
  if(typeof destination !== 'string') {
    res.status(400).send("missing destination");
    return;
  }

  const renderedMailHTML = await renderEmail(templateName, data);

  sendMail(destination, "test", renderedMailHTML);
  // fs.writeFileSync("/tmp/example-email.html", renderedMailHTML, "utf-8");
  res.send("done");
});

server.listen(8080);
