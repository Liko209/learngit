const bpmr = require("babel-plugin-module-resolver");

function resolvePath(sourcePath, currentFile, opts) {
  if (sourcePath === "markdown") {
    const base = currentFile.substring(__dirname.length).slice(0, -3);
    return `${__dirname}/docs/src/${base}/`;
  }

  return bpmr.resolvePath(sourcePath, currentFile, opts);
}

module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          modules: "commonjs"
        }
      }
    ]
  ],
  plugins: [
    "babel-plugin-preval",
    [
      "babel-plugin-module-resolver",
      {
        alias: {
          docs: "./docs",
          pages: "./pages"
        },
        transformFunctions: ["require", "require.context"],
        resolvePath
      }
    ]
  ],
  ignore: [/@babel[\\|/]runtime/]
};
