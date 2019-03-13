module.exports = [
  // {
  //   urlPattern: new RegExp("https://glipdevasia-dev.s3.amazonaws.com"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://glipasialabnet-xmnup.s3.amazonaws.com"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://d2rbro28ib85bu.cloudfront.net"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://aws13-g04-uds02.asialab.glip.net:11907"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://glpdevxmn.asialab.glip.net:31337"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://cache.glip.com"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://xmnup.asialab.glip.net:31337"),
  //   handler: "staleWhileRevalidate"
  // },
  // {
  //   urlPattern: new RegExp("https://fonts.gstatic.com/s/materialicons"),
  //   handler: "staleWhileRevalidate"
  // }

  {
    urlPattern: new RegExp("jupiter-icon.svg"),
    handler: "staleWhileRevalidate",
    options: {
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    urlPattern: new RegExp("load-svg-icon.js"),
    handler: "cacheFirst"
  }
];
