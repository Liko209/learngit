import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ensuredOneVoicemail } from '../../fixtures/PhoneTab/Voicemail/utils';



fixture('Phone/Voicemail')
 .beforeEach(setupCase(BrandTire.RCOFFICE))
 .afterEach(teardownCase());

 test(formalName('Check the Voicemail page', ['P2', 'Phone', 'Voicemail', 'V1.6', 'Hank.Huang']), async (t) => {
  const callee = h(t).rcData.mainCompany.users[4];
  const caller = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${callee.company.number}#${callee.extension}`, async () => {
    await h(t).glip(callee).init();
    await h(t).glip(callee).setDefaultPhoneApp('glip');
    await h(t).platform(callee).deleteALlBlockOrAllowPhoneNumber();
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  const voicemailEntry = app.homePage.phoneTab.voicemailEntry;
  const voicemailPage = app.homePage.phoneTab.voicemailPage;

  await h(t).withLog('When I open the voicemail page', async() => {
    await leftPanel.phoneEntry.enter();
    await voicemailEntry.enter();
  });

  const voicemailItemFromExt = voicemailPage.voicemailItemByNth(0);
  const telephoneDialog = app.homePage.telephonyDialog;
  const deleteVoicemailDialog = app.homePage.deleteVoicemailDialog;

  await h(t).withLog('And I minimize the telephone dialog', async() => {
    if (await telephoneDialog.exists) {
      await telephoneDialog.clickMinimizeButton()
    };
  });

  await h(t).withLog('And I delete exists voicemail', async() => {
    while(await voicemailItemFromExt.exists){
        await voicemailItemFromExt.openMoreMenu();
        await voicemailItemFromExt.clickDeleteButton();
        await deleteVoicemailDialog.clickDeleteButton();
    };
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailPage' });

  await h(t).withLog('When I add a voicemail', async () => {
    await ensuredOneVoicemail(t, caller, callee, app);
  });

  await h(t).withLog('And I hover the "more" button', async() => {
    await voicemailItemFromExt.hoverMoreButton();
  });

  await h(t).withLog('Then "more" button should be displayed' , async() => {
    await t.expect(voicemailItemFromExt.moreMenuButton.exists).ok;
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailMoreButton'});

  await h(t).withLog('When I open the "more" menu', async() => {
    await voicemailItemFromExt.openMoreMenu();
  });

  await h(t).withLog('Then "more" menu should be displayed' , async() => {
    await t.expect(voicemailItemFromExt.downloadButton.exists).ok;
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailMoreMenu01'});

  await h(t).withLog('When I click the "readButton" button', async() => {
    await voicemailItemFromExt.clickReadToggle();
    await voicemailItemFromExt.openMoreMenu();
  });

  await h(t).withLog('Then "more" menu should be displayed' , async() => {
    await t.expect(voicemailItemFromExt.unreadButton.exists).ok;
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailMoreMenu02'});

  await h(t).withLog('When I click the "delete" button in "more" menu', async() => {
    await voicemailItemFromExt.clickDeleteButton();
  });

  await h(t).withLog('Then delete dialog should be displayed' , async() => {
    await t.expect(deleteVoicemailDialog.exists).ok;
  });
  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_DeleteVoicemailDialog'});

  await h(t).withLog('When I hover the "message" button', async() => {
    await deleteVoicemailDialog.clickCancelButton();
    await voicemailItemFromExt.hoverMessageButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailMessageButton'});

  await h(t).withLog('When I hover the "callback" button', async() => {
    await voicemailItemFromExt.hoverCallbackButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailCallbackButton'});

  await h(t).withLog('When I hover the "Play" button', async() => {
    await voicemailItemFromExt.hoverPlayButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailPlayButton'});

  await h(t).withLog('When I set filter and check the search result'  , async() => {
    await voicemailItemFromExt.setVoicemailFilter("xxxxxxxxxxxxx");
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailNoMatchesFound'});
});
