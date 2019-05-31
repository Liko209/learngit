/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 10:20:49
 */

import { Globals, Config } from '.';
import { initModel, closeDB } from "./dtos";
import { DashboardService } from "./services";
const createTestCafe = require('testcafe');
const selfSignedCert = require('openssl-self-signed-certificate');

const sslOptions = {
  key: selfSignedCert.key,
  cert: selfSignedCert.cert
};

const sceneMap = {
  IndexDataScene: 'src/scenes/indexDataScene.ts',
  SearchScene: 'src/scenes/searchScene.ts',
  SwitchConversationScene: 'src/scenes/switchConversationScene.ts',
  FetchGroupScene: 'src/scenes/fetchGroupScene.ts',
};

(async () => {
  await initModel();

  const testCafe = await createTestCafe(undefined, undefined, undefined, sslOptions);
  const runner = testCafe.createRunner();
  const browsers = [
    'electron:./',
    'selenium:firefox'
  ];

  const fixtures = ['src/scenes/version.ts'];
  for (let scene of Object.keys(sceneMap)) {
    const src = sceneMap[scene];
    scene = scene.toLowerCase();

    if (Config.includeScene.length === 0) {
      fixtures.push(src);
      continue;
    }

    for (let s of Config.includeScene) {
      if (scene === s.toLowerCase()) {
        fixtures.push(src);
        break;
      }
    }
  }

  runner.src(fixtures).concurrency(1);

  try {
    for (let browser of browsers) {
      Globals.task = undefined;
      Globals.browser = browser;

      DashboardService.clear();

      runner.browsers([Globals.browser]);

      await runner.run({
        skipJsErrors: true,
        skipUncaughtErrors: true,
        stopOnFirstFail: false,
        quarantineMode: false
      });

      await DashboardService.buildReport();
    }

  } finally {
    await testCafe.close();
    await closeDB();
    process.exit(0);
  }
})()


