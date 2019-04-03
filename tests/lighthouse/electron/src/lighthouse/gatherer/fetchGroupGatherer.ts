/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { GroupPage } from "../../pages";

class FetchGroupGatherer extends Gatherer {
  private artifacts: Map<string, Array<any>> = new Map();

  beforePass(passContext) { }

  async pass(passContext) {
    let groupPage = new GroupPage({ passContext });

    let page = await groupPage.page();
    let keys = [
      "group_section_fetch_teams",
      "group_section_fetch_favorites",
      "group_section_fetch_direct_messages"
    ];
    for (let k of keys) {
      this.artifacts.set(k, []);
    }

    for (let i = 0; i < 40; i++) {
      try {
        await page.reload({ waitUntil: "networkidle2" });

        await groupPage.waitForCompleted();

        let metrics = await page.evaluate(() => {
          return performance["jupiter"];
        });

        for (let k of keys) {
          if (metrics[k] && metrics[k].length > 0) {
            this.artifacts.set(k, this.artifacts.get(k).concat(metrics[k]));
          }
        }
      } catch (err) { }
    }
  }

  async afterPass(passContext) {
    return {
      group_section_fetch_teams: {
        api: this.artifacts.get("group_section_fetch_teams"),
        ui: []
      },
      group_section_fetch_favorites: {
        api: this.artifacts.get("group_section_fetch_favorites"),
        ui: []
      },
      group_section_fetch_direct_messages: {
        api: this.artifacts.get("group_section_fetch_direct_messages"),
        ui: []
      }
    };
  }
}

export { FetchGroupGatherer };
