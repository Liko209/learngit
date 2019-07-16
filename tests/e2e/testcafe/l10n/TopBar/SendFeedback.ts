import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";




fixture('TopBar/SendFeedback')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Send a feedback',['P2', 'TopBar', 'SendFeedback', 'V1.6', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const settingMenu = app.homePage.settingMenu;
  const topBarAvatar = app.homePage.topBarAvatar;
  const aboutDialog = app.homePage.AboutRingCentralDialog;
  const sendFeedBackDialog = app.homePage.sendFeedBackDialog;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I click "New actions" button', async() => {
    await t.click(topBarAvatar);
    await settingMenu.clickSendFeedBackButton();
  });

  await h(t).withLog('Then "Send Feedback" dialog should be displayed' , async() => {
    await t.expect(aboutDialog.title.exists).ok();
  });
  //await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_SendFeedbackDialog'});

  await h(t).withLog("When I send a feedback", async() => {
    await sendFeedBackDialog.clickSendButton();
  });
   await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_SendSeeding'});
   await t.wait(2000);
   await h(t).log('And I take screenshot', {screenshotPath:'Jupiter_TopBar_SendFeedbackFail'});
});
