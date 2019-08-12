import * as _ from "lodash";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { setupCase, teardownCase } from "../../init";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from "../../config";

fixture("Phone/EmptyCallHistory")
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(
  formalName("Check empty call history", [
    "P2",
    "Phone",
    "EmptyCallHistory",
    "V1.6",
    "Sean.Zhuang"
  ]),
  async t => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];

    const app = new AppRoot(t);

    await h(t).withLog(
      `Given I login Jupiter with ${loginUser.company.number}#${
        loginUser.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      }
    );

    const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
    const telephoneDialog = app.homePage.telephonyDialog;
    const deleteAllCallDialog = app.homePage.deleteAllCalllDialog;

    await h(t).withLog("When I click Phone entry of leftPanel", async () => {
      await app.homePage.leftPanel.phoneEntry.enter();
    });

    await h(t).withLog("And minimize phone dialog", async () => {
      if (await telephoneDialog.exists) {
        await app.homePage.closeE911Prompt();
        await telephoneDialog.clickMinimizeButton();
      }
    });

    await h(t).withLog("And I clear call history ", async () => {
      if (!(await callHistoryPage.emptyPage.exists)) {
        await callHistoryPage.clickMoreIcon();
        await callHistoryPage.clickDeleteAllCallButton();
        await deleteAllCallDialog.clickDeleteButton();
      }
    });

    await h(t).log("Then I take screenshot", {
      screenshotPath: "Jupiter_Phone_EmptyCallHistory"
    });
  }
);
