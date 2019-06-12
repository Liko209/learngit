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

fixture('IndexDataScene')
  .beforeEach(setupCase(CaseFlags.METRIC))
  .afterEach(teardownCase(CaseFlags.METRIC));

test('Index Data Scene', async (t: TestController) => {
  if (!(await execActions("test", CaseFlags.METRIC, t))) {
    return;
  }

  h(t).setSceneName("IndexDataScene");

  const page = new Page(t);

  const metricKeys: Array<string> = [
    "handle_initial_incoming_account",
    "handle_initial_incoming_company",
    "handle_initial_incoming_item",
    "handle_initial_incoming_presence",
    "handle_initial_incoming_state",
    "handle_initial_incoming_profile",
    "handle_initial_incoming_person",
    "handle_initial_incoming_group",
    "handle_initial_incoming_post",
    "handle_remaining_incoming_account",
    "handle_remaining_incoming_company",
    "handle_remaining_incoming_item",
    "handle_remaining_incoming_presence",
    "handle_remaining_incoming_state",
    "handle_remaining_incoming_profile",
    "handle_remaining_incoming_person",
    "handle_remaining_incoming_group",
    "handle_remaining_incoming_post",
    "handle_index_incoming_account",
    "handle_index_incoming_company",
    "handle_index_incoming_item",
    "handle_index_incoming_presence",
    "handle_index_incoming_state",
    "handle_index_incoming_profile",
    "handle_index_incoming_person",
    "handle_index_incoming_group",
    "handle_index_incoming_post",
    "handle_index_data",
    "handle_remaining_data",
    "handle_initial_data",
  ];

  let len1, len2, cnt;

  await h(t).getBrowser().deleteAllCache();

  await h(t).getMetricHelper().begin(metricKeys);
  for (let i = 0; i < Config.sceneRepeatCount; i++) {
    try {
      cnt = 20;
      len1 = h(t).getMetricHelper().getResult()['handle_index_data'].length;
      await t.navigateTo(await JupiterUtils.getAuthUrl(Config.jupiterHost, t));

      await page.ensureLoaded();

      while (cnt-- > 0) {
        len2 = h(t).getMetricHelper().getResult()['handle_index_data'].length;
        if (len1 >= len2) {
          await t.wait(2000);
          continue;
        }

        break;
      }

      await h(t).getBrowser().deleteAllCache();
    } catch (err) {
      continue;
    }
  }

  await h(t).getMetricHelper().end();
});
