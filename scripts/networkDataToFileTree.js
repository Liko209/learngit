const path = require('path');
const fs = require('fs');

console.log('read json from:', process.argv[2]);
const dataArray = JSON.parse(
  fs.readFileSync(process.argv[2], {
    encoding: 'utf8',
  }),
);

function makeDirs(pathStr) {
  if (!fs.existsSync(pathStr)) {
    const paths = pathStr.split('/');
    paths.pop();
    makeDirs(paths.join('/'));
    console.log('mkdir:', pathStr);
    fs.mkdirSync(pathStr);
  }
}

dataArray.forEach(data => {
  const { method, host } = data;
  const _path = data.path.replace(/\~/g, '-');
  const _finalDir = path.join(__dirname, '../tests/shield/testingData', host, _path);
  makeDirs(_finalDir);
  const jsonName = path.resolve(_finalDir, `${method.toUpperCase()}.template.json`);
  console.log('writing json: ', jsonName);
  fs.writeFileSync(jsonName, JSON.stringify(data, null, 2));
});
