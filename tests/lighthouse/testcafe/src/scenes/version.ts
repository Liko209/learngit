import { setupCase, teardownCase, h } from '..';
import { Config } from '../config';
import { VersionInfo, CaseFlags } from '../models';
import { LoginPage } from '../pages';

fixture('Version')
  .beforeEach(setupCase(CaseFlags.VERSION))
  .afterEach(teardownCase(CaseFlags.VERSION));

test('Get Jupiter version', async (t: TestController) => {
  const loginPage = new LoginPage(t);

  const getVersion = async (host): Promise<VersionInfo> => {
    await t.navigateTo(host);

    await loginPage.ensureLoaded();

    const version = await loginPage.version();

    return await h(t).getBrowser().getVersionInfo(version);
  }

  const hosts = [
    Config.jupiterHost,
    Config.jupiterDevelopHost,
    Config.jupiterReleaseHost,
    Config.jupiterStageHost
  ];

  for (let host of hosts) {
    h(t).setVersion(host, await getVersion(host));
  }
});
