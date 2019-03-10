const axios = require("axios");
const fs = require("fs");
const path = require("path");

axios
  .get(
    `https://i.icomoon.io/public/6483cc0f53/Jupiter/symbol-defs.svg?${Math.random()}`
  )
  .then(res => {
    fs.writeFile(
      path.join(__dirname, "../public/jupiter-icon.svg"),
      res.data,
      "utf8",
      err => {
        if (err) throw err;
        console.log("icon updated");
      }
    );
  });
