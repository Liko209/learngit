/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 10:34:39
 */
import { setupCase, teardownCase, h } from '..';
import { JupiterUtils } from '../utils';
import { Config } from '../config';
import { Page } from '../pages';
import { CaseFlags } from '../models';
import { execActions } from '../actions';

fixture('FetchGroupScene')
  .beforeEach(setupCase(CaseFlags.METRIC))
  .afterEach(teardownCase(CaseFlags.METRIC));

test('Fetch group scene', async (t: TestController) => {
  if (!(await execActions("test", CaseFlags.METRIC, t))) {
    return;
  }

  h(t).setSceneName("FetchGroupScene");

  const page = new Page(t);

  const metricKeys: Array<string> = [
    "group_section_fetch_teams",
    "group_section_fetch_favorites",
    "group_section_fetch_direct_messages"
  ];

  await h(t).getBrowser().deleteAllCache();

  let cnt = 20;
  while (cnt-- > 0) {
    await t.navigateTo(await JupiterUtils.getAuthUrl(Config.jupiterHost, t));

    await page.ensureLoaded();

    break;
  }

  let lengthMap = {}, result, flag;
  await h(t).getMetricHelper().begin(metricKeys);
  for (let i = 0; i < Config.sceneRepeatCount; i++) {
    try {
      cnt = 20;

      result = h(t).getMetricHelper().getResult();
      for (let k of metricKeys) {
        lengthMap[k] = result[k].length;
      }

      await t.wait(1000);
      await t.navigateTo(Config.jupiterHost);

      while (cnt-- > 0) {
        flag = true;

        result = h(t).getMetricHelper().getResult();
        for (let k of this.metricKeys) {
          if (lengthMap[k] >= result[k].length) {
            flag = false;
            break;
          }
        }

        if (!flag) {
          await t.wait(2000);
          continue;
        }

        break;
      }
    } catch (err) {
      continue;
    }
  }

  await h(t).getMetricHelper().end();
});
