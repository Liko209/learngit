const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../3G-CPU6x.json");

let rawdata = fs.readFileSync(filePath);
let cable = JSON.parse(rawdata);
const plotly = require("plotly")("dennis.jiang", "0YJizrf5JtDBsOnqGoWv");
const _ = require("lodash");

cable = _.sortBy(cable, variable);
var variable = _.uniq(_.map(cable, "variable"));
// console.log(variable);
var runsvariable = _.concat(variable, variable, variable, variable, variable);
// console.log(runsvariable);
var x = _.sortBy(runsvariable);
// console.log(x);
// console.log(_.map(_.filter(cable, ["stage", "1. sw&cache"]), "value"));
var trace1 = {
  y: _.map(_.filter(cable, ["stage", "1. sw&cache"]), "value"),
  x: x,
  name: "1. sw and cache",
  marker: { color: "#FF4136" },
  type: "box"
};
var trace2 = {
  y: _.map(_.filter(cable, ["stage", "2. sw"]), "value"),
  x: x,
  name: "2. sw",
  marker: { color: "#3D9970" },
  type: "box"
};
var trace3 = {
  y: _.map(_.filter(cable, ["stage", "3. cache"]), "value"),
  x: x,
  name: "3. cache",
  marker: { color: "#FF851B" },
  type: "box"
};
var trace4 = {
  y: _.map(_.filter(cable, ["stage", "4. no cache and sw"]), "value"),
  x: x,
  name: "4. no cache and sw",
  marker: { color: "#904FFF" },
  type: "box"
};
// var trace2 = {
//   y: [0.6, 0.7, 0.3, 0.6, 0.0, 0.5, 0.7, 0.9, 0.5, 0.8, 0.7, 0.2],
//   x: x,
//   name: "radishes",
//   marker: { color: "#FF4136" },
//   type: "box"
// };
// var trace3 = {
//   y: [0.1, 0.3, 0.1, 0.9, 0.6, 0.6, 0.9, 1.0, 0.3, 0.6, 0.8, 0.5],
//   x: x,
//   name: "carrots",
//   marker: { color: "#FF851B" },
//   type: "box"
// };
var data = [trace1, trace2, trace3, trace4];
var layout = {
  yaxis: {
    title: "normalized moisture",
    zeroline: false
  },
  boxmode: "group"
};
var graphOptions = {
  layout: layout,
  filename: "box-grouped",
  fileopt: "overwrite"
};
plotly.plot(data, graphOptions, function(err, msg) {
  console.log("Plot available in:", msg);
});
