/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 10:34:39
 */
import { setupCase, teardownCase, h, Config } from '..';
import { JupiterUtils, LogUtils } from '../utils';
import { HomePage } from '../pages';
import { CaseFlags } from '../models';
import { execActions } from '../actions';

fixture('SwitchConversationScene')
  .beforeEach(setupCase(CaseFlags.METRIC))
  .afterEach(teardownCase(CaseFlags.METRIC));

test('Switch conversation scene', async (t: TestController) => {
  if (!(await execActions("test", CaseFlags.METRIC, t))) {
    return;
  }

  h(t).setSceneName("SwitchConversationScene");

  const metricKeys: Array<string> = [
    'goto_conversation_fetch_posts',
    'goto_conversation_fetch_items',
    'conversation_fetch_from_db',
  ];

  const page = new HomePage(t);
  const conversationIds = Config.switchConversationIds;
  const logger = LogUtils.getLogger(__filename);

  const switchConversation = async (page: HomePage, switchCount: number = -1) => {
    if (!conversationIds || conversationIds.length <= 1) {
      logger.warn("conversationIds size is less than 1, switch fail!");
      return;
    }

    if (switchCount <= 0) {
      switchCount = conversationIds.length;
    }

    let id, index = 0;
    while (index < switchCount) {
      id = conversationIds[index++ % conversationIds.length];
      try {
        await page.switchConversationById(id);
      } catch (err) {
      }
    }
  }

  await h(t).getBrowser().deleteAllCache();

  let cnt = 20;
  while (cnt-- > 0) {
    await t.navigateTo(await JupiterUtils.getAuthUrl(Config.jupiterHost, t));

    await page.ensureLoaded();

    break;
  }

  await switchConversation(page);

  await h(t).getMetricHelper().begin(metricKeys);

  await switchConversation(page, Config.sceneRepeatCount);

  await h(t).getMetricHelper().end();
});
