var y0 = [],
  y1 = [];
for (var i = 0; i < 50; i++) {
  y0[i] = Math.random();
  y1[i] = Math.random() + 1;
}

const fs = require("fs");

let rawdata = fs.readFileSync("../cable.json");
let data = JSON.parse(rawdata);
const plotly = require("plotly")("dennis.jiang", "0YJizrf5JtDBsOnqGoWv");
var trace1 = {
  y: y0,
  type: "box"
};
var trace2 = {
  y: y1,
  type: "box"
};
var data = [trace1, trace2];
var graphOptions = { filename: "basic-box-plot", fileopt: "overwrite" };
plotly.plot(data, graphOptions, function(err, msg) {
  console.log(msg);
});
