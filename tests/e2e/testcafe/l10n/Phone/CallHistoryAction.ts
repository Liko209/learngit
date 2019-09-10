import * as _ from "lodash";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { setupCase, teardownCase } from "../../init";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from "../../config";
import { ensuredOneMissCallLog } from "../../fixtures/PhoneTab/CallHistory/utils";

fixture("Phone/CallHistoryAction")
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test(
  formalName("Check call history action tips and delete call log popup", [
    "P2",
    "Phone",
    "CallHistoryAction",
    "V1.6",
    "Sean.Zhuang"
  ]),
  async t => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[5];
    const otherUser = users[6];

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

    await h(t).withLog("And click call history entry", async () => {
      await app.homePage.phoneTab.callHistoryEntry.enter();
    });

    await h(t).withLog("Then call history page should be open", async () => {
      await callHistoryPage.ensureLoaded();
    });

    await h(t).withLog("When I clear call history ", async () => {
      if (!(await callHistoryPage.emptyPage.exists)) {
        await callHistoryPage.clickMoreIcon();
        await callHistoryPage.clickDeleteAllCallButton();
        await deleteAllCallDialog.clickDeleteButton();
      }
    });

    await h(t).withLog("And generate a new call log", async () => {
      await ensuredOneMissCallLog(t, otherUser, loginUser, app);
      await h(t).reload();
      await callHistoryPage.ensureLoaded();
    });

    const callHistoryItem = callHistoryPage.callHistoryItemByNth(0);
    await h(t).withLog('And I hover "Call" button', async () => {
      await callHistoryItem.hoverCallBackButton();
    });

    await h(t).log("Then I take screenshot", {
      screenshotPath: "Jupiter_Phone_CallBack"
    });

    await h(t).withLog('When I hover "Message" button', async () => {
      await callHistoryItem.hoverMessageButton();
    });

    await h(t).log("Then I take screenshot", {
      screenshotPath: "Jupiter_Phone_Message"
    });

    await h(t).withLog('When I hover "Delete" button', async () => {
      await callHistoryItem.hoverDeleteButton();
    });

    await h(t).log("Then I take screenshot", {
      screenshotPath: "Jupiter_Phone_Delete"
    });

    await h(t).withLog('When I click "Delete" button', async () => {
      await callHistoryItem.clickDeleteButton();
    });

    const deleteCallHistoryDialog = app.homePage.deleteCallHistoryDialog;

    await h(t).withLog(
      "Then the delete confirm dialog should be showed",
      async () => {
        await deleteCallHistoryDialog.ensureLoaded();
      }
    );

    await h(t).log("And I take screenshot", {
      screenshotPath: "Jupiter_Phone_DeleteCallLog"
    });
  }
);
