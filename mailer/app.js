const express          = require('express');

const { renderEmail }  = require('./src/mail-render');
const { sendMail }     = require('./src/sender');

const config           = require('nice-config-loader')();

const port = config.get("port") || 3000;

const server = express();
server.use(express.json());

server.post('*', async (req, res) => {
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
  res.send("done");
});

server.listen(port);
