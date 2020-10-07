const express     = require('express');

const config      = require('nice-config-loader')();

const port            = config.get("port") || 3000;
const destination_dir = config.get("destination_dir");
const self_hostname   = config.get("self_hostname");

const { getReadableStream, getWritableStream } = require('./storage_plugins/fs-storage-plugin.js');

const server = express();

server.get("/healthz", (req, res) => {
  res.send("healthy");
});

const imageRouter = express.Router();

imageRouter.post('/upload', async(req, res) => {
  if(!req.is("image/*")) {
    let errorMessage = `the /upload destination was hit, but content-type is ${req.get("Content-Type")}`;
    console.log(errorMessage);
    res.status(415).send(errorMessage);
    return;
  }

  let imageType = req.get("Content-Type").split('/')[1]; //TODO this is a security risk, validate before using
  let [ err, writeStream ] = await getWritableStream({ suffix: imageType });
  if (err) {
    console.log("error while trying to write", err);
    return res.status(500).end();
  }

  let imageName = writeStream.getID();
  req.on('end', () => {
    req.unpipe();
    writeStream.close();
    res.json({
      imageRelativeLink: `/images/${imageName}`,
      imageFullLink: `${self_hostname}/images/${imageName}`
    });
  });
  req.pipe(writeStream);
});

imageRouter.get('/:id', async(req, res) => {
  let [ err, readStream ] = await getReadableStream(req.params['id']);
  if(err) {
    if(err.code === "ENOENT") {
      let message = `404 - ${req.params['id']} not found`;
      console.log(message);
      return res.status(404).send(message);
    }
    console.log("error while trying to fetch image", err);
    return res.status(500).send("error while trying to fetch image");
  }

  readStream.pipe(res);
});

server.use('/images', imageRouter);
server.listen(port);
