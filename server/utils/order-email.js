const request = require('request');

module.exports = {
  emailOrder
}

const mailer_uri = "http://" + process.env['MAILER__HOSTNAME'] +
    ":" + (process.env['MAILER__PORT'] ?? "80");

const mailer_request_template = {
  templateName: process.env['MAILER__DEFAULT_ORDER_TEMPLATE']
}

const receipt_link_prefix = process.env['SELF_HOSTNAME'] + "/order/";

function emailOrder(order, destination) {
  console.log(order);

  return new Promise(function(resolve, reject) {
    if (typeof destination !== 'string') {
      reject(new Error(""))
    }

    let mailer_request = Object.assign({}, mailer_request_template);
    mailer_request.destination = destination;

    mailer_request.data = {
      orders: []
    }

    order.products.forEach((product) => {
      mailer_request.data.orders.push({
        produce: product.name,
        packageSize: product.packageSize,
        packageUnit: product.packageUnit,
        quantity: product.quantity,
        price: (product.price * product.quantity) + "₪"
      })
    })

    let total = 0;
    order.products.forEach(p => total += (p.price * p.quantity));
    mailer_request.data.sub_total = total + "₪";

    mailer_request.data.receipt_link = receipt_link_prefix + order._id;

    //TODO this is hardcoded - take from the farmer entry instead
    mailer_request.data.header_image_url = "https://klino-farmers.fra1.cdn.digitaloceanspaces.com/strawberries.jpg";

    // TODO: this is hardcoded - generate from receipt_link instead
    mailer_request.data.qr_src = "https://klino-farmers.fra1.digitaloceanspaces.com/qr-farmers-example-email.png";

    request.post({
      url: mailer_uri,
      method: 'POST',
      json: mailer_request
    }, (error, response, body) => {
      if (error) {
        reject(error)
        return;
      }
      resolve(body);
    })
  });
}
