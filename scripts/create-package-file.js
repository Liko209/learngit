const path = require('path');
const fse = require('fs-extra');

const argv = process.argv.slice(2);

const p = argv[0];
const destination = argv[1];

async function createPackageFile(p, destination) {
  const packageData = await fse.readFile(path.resolve(p, './package.json'), 'utf8');
  const { nyc, scripts, devDependencies, workspaces, ...packageDataOther } = JSON.parse(
    packageData,
  );
  const newPackageData = {
    ...packageDataOther,
    main: 'index.js',
    module: 'index.js',
    typings: "index.d.ts",
    name: destination.split('/').pop(),
  };
  const buildPath = path.resolve(destination, './package.json');

  await fse.writeFile(buildPath, JSON.stringify(newPackageData, null, 2), 'utf8');
  console.log(`Created package.json in ${buildPath}`);

  return newPackageData;
}

createPackageFile(p, destination);
