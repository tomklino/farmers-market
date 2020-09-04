const fs          = require('fs');
const path        = require('path');

const config      = require('nice-config-loader')();

const destination_dir = config.get("destination_dir");

module.exports = {
  getWritableStream,
  getReadableStream
}

function* generateImageName() {
  let i = 1;
  while(true) {
    yield "image-" + i;
    i++;
  }
}
const imageNameIterator = generateImageName();

function fileExists(path) {
  return new Promise(function(resolve) {
    fs.access(path, fs.F_OK, (err) => {
      if(err) {
        return resolve(false)
      }
      resolve(true);
    })
  });
}

async function getWritableStream({suffix}) {
  let imageID = imageNameIterator.next().value;
  let imageName = `${imageID}.${suffix}`;
  let fileLocation = path.join(destination_dir, imageName);
  let writeStream = fs.createWriteStream(fileLocation);

  writeStream.getID = function() {
    return imageName;
  }

  return [ null, writeStream ];
}

async function getReadableStream(id) {
  let fileLocation = path.join(destination_dir, id);
  if (!await fileExists(fileLocation)) {
    let err = new Error("Not Found");
    err.code = "ENOENT";
    return [ err, null ];
  }

  let readableStream = fs.createReadStream(fileLocation);
  return [ null, readableStream ];
}
