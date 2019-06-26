import { Selector } from 'testcafe';
import { MenuRoot } from "./page-models/MenuRoot";
import Process from './a11y/process'
import { TEST_URL, FILE_PATH } from "./config";
import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from "path";
import { MiscUtils } from "./utils/utils";

fixture`rcui test`
  .page(TEST_URL);


test('test one', async t => {

  const menuRoot = new MenuRoot(t);

  await t.expect(menuRoot.self.child().count).gt(0, { timeout: 60e3 });

  MiscUtils.createDirIfNotExists(FILE_PATH, { recursive: true });

  console.log("section's children count>>", await menuRoot.menuItemCount());

  const process = new Process(t);
  while (await menuRoot.hasNextItem()) {
    await process.showAndCheck(await menuRoot.nextItem(), menuRoot);
  }

  const jsonDir = path.join(FILE_PATH, "json");
  const htmlDir = path.join(FILE_PATH, "html");
  MiscUtils.createDirIfNotExists(htmlDir);
  await process.json2html(jsonDir, htmlDir);

  processResult(jsonDir);

  console.log('finish')
});

function processResult(jsonDir: string) {

  fs.readdir(jsonDir, function (err, files) {
    let allPass: string[] = [];
    let noAllPass: string[] = [];

    for (const file of files) {
      const filePath = `${jsonDir}/${file}`;
      const title = file.substring(0, file.length - 5);
      const data = fs.readFileSync(filePath, { encoding: "utf-8" });

      const json = JSON.parse(data);
      if (isAllPass(json)) {
        allPass = allPass.concat(title);
      } else {
        noAllPass = noAllPass.concat(title);
      }
    }

    const allPassFile = path.join(FILE_PATH, "allPass.txt");
    const noAllPassFile = path.join(FILE_PATH, "noAllPass.txt");
    fs.writeFileSync(allPassFile, allPass.join("\n"));
    fs.writeFileSync(noAllPassFile, noAllPass.join("\n"));
  })
}

function isAllPass(json: JSON) {
  return _.isEmpty(_.get(json, ['findings', 'violations']));
}
