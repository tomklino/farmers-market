const express     = require('express');
const fs          = require('fs');
const path        = require('path');

const config      = require('nice-config-loader')();

const port = config.get("port") || 3000;
const destination_dir = config.get("destination_dir");

const server = express();

var imageRouter = express.Router();
const imageNameIterator = generateImageName();

imageRouter.post('/upload', async(req, res) => {
  if(!req.is("image/*")) {
    let errorMessage = `the /upload destination was hit, but content-type is ${req.get("Content-Type")}`;
    console.log(errorMessage);
    res.status("400").send(errorMessage);
    return;
  }
  let imageID = imageNameIterator.next().value;
  let imageType = req.get("Content-Type").split('/')[1]; //TODO this is a security risk, validate before using
  let imageDestination = path.join(destination_dir, imageID + "." + imageType);
  console.log(`saving image to ${imageDestination}`);
  let writeStream = fs.createWriteStream(imageDestination);
  req.on('end', () => {
    req.unpipe();
    writeStream.close();
    res.end();
  })
  req.pipe(writeStream);
});

imageRouter.get('/:id', async(req, res) => {
  let readStream = fs.createReadStream(path.join(destination_dir, req.params['id']));
  readStream.on('error', (err) => {
    if(err.code === "ENOENT") {
      res.status(404).send("file not found: " + req.params['id']);
      console.log("404 - file not found " + req.params['id']);
      readStream.close();
      return;
    }
    res.status(500).send("unknown server error");
    console.log("error while trying to serve image", err.code, err.message);
    readStream.close();
    return;
  });
  readStream.pipe(res);
});

imageRouter.get('/', async(req, res) => {

});

server.use('/images', imageRouter);
server.listen(port);

function* generateImageName() {
  let i = 1;
  while(true) {
    yield "image-" + i;
    i++;
  }
}
