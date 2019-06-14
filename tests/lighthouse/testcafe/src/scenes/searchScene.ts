/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 10:34:39
 */
import { setupCase, teardownCase, h, Config } from '..';
import { JupiterUtils, LogUtils } from '../utils';
import { HomePage } from '../pages';
import { CaseFlags } from '../models';
import { execActions } from '../actions';

fixture('SearchScene')
  .beforeEach(setupCase(CaseFlags.METRIC))
  .afterEach(teardownCase(CaseFlags.METRIC));

test('Search Scene', async (t: TestController) => {
  if (!(await execActions("test", CaseFlags.METRIC, t))) {
    return;
  }

  h(t).setSceneName("SearchScene");

  const metricKeys: Array<string> = [
    "search_group",
    "search_people",
    "search_team"
  ];

  const page = new HomePage(t);
  const keywords = Config.searchKeywords;
  const logger = LogUtils.getLogger(__filename);

  const search = async (page: HomePage, searchCount: number = -1) => {
    if (!keywords || keywords.length <= 1) {
      logger.warn("keywords size is less than 1, switch fail!");
      return;
    }

    if (searchCount <= 0) {
      searchCount = keywords.length;
    }

    let keyword, index = 0;
    while (index < searchCount) {
      keyword = keywords[index++ % keywords.length];
      try {
        await page.searchByKeyword(keyword);
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

  await search(page);

  await h(t).getMetricHelper().begin(metricKeys);

  await search(page, Config.sceneRepeatCount);

  await h(t).getMetricHelper().end();
});
