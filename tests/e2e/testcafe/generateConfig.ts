const inquirer = require('inquirer');
const jsonfile = require('jsonfile');
const fs = require('fs');
const execa = require('execa');
const path = require("path");

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
let onMerge = {} as any;
const fixtures = [];
let fileName;

async function getCurrentBranch() {
  return await execa('git', ['name-rev', '--name-only', 'HEAD']);
}

function inputFixture() {
  inquirer.prompt([
    {
      type: 'fuzzypath',
      name: 'path',
      excludePath: nodePath => {
        return (nodePath !== './' && !nodePath.startsWith('fixtures') && !nodePath.startsWith('telephony')) || fixtures.includes(nodePath)
      },
      itemType: 'any',
      rootPath: './',
      message: 'Select fixture(select ./ represent exit):',
      suggestOnly: false,
    }
  ]).then(answers => {
    fixtures.push(answers.path);
    if (answers.path != './') {
      inputFixture();
    } else {
      onMerge.fixtures = fixtures;
      chooseTags()
    }
  })
}

function chooseTags() {
  inquirer.prompt([{
    type: 'checkbox',
    message: 'please choose include tags:',
    name: 'include_tags',
    choices: ["ALL", "P0", "P1", "P2"]
  }, {
    type: 'checkbox',
    message: 'please choose exclude tags:',
    name: 'exclude_tags',
    choices: ["ALL", "P0", "P1", "P2"]
  }]).then(answer => {
    onMerge = Object.assign(onMerge, answer);
    saveToFile(onMerge)
  })
}

function saveToFile(onMerge) {
  processFixtures(onMerge);
  const jsonContent = { "on_merge": onMerge };
  jsonfile.writeFileSync(fileName, jsonContent);
  console.log(jsonContent);
  console.log('success');
}

function processFixtures(onMerge) {
  const newFixtures = [];
  for (const fixture of onMerge.fixtures) {
    if (fixture == './') continue;
    const info = fs.statSync(fixture);
    if (info.isDirectory()) {
      newFixtures.push(path.join("./", fixture, "/**/*.ts"))
    } else {
      newFixtures.push(path.join("./", fixture))
    }
  }
  onMerge.fixtures = newFixtures;
}

async function inputFileName() {
  const currentBranch: string = (await getCurrentBranch()).stdout;
  await inquirer.prompt([{
    type: 'input',
    message: 'please input file name:',
    name: 'fileName',
    default: currentBranch + ".json"
  }]).then(answer => {
    fileName = path.join("configs/", answer.fileName);
    inputFixture();
  });
}

async function start() {
  await inputFileName();
}

start();