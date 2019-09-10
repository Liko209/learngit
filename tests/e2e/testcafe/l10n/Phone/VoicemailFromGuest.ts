import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { addOneVoicemailFromAnotherUser } from '../../fixtures/PhoneTab/Voicemail/utils';



fixture('Phone/VoicemailFromGuest')
 .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
 .afterEach(teardownCase());

 test(formalName('Check the Voicemail form guest page', ['P2', 'Phone', 'VoicemailFromGuest', 'V1.6', 'Hank.Huang']), async (t) => {
  const callee = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.guestCompany.users[0];
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

  const telephoneDialog = app.homePage.telephonyDialog;
  const voicemailItemFromGuest = voicemailPage.voicemailItemByNth(0);

  await h(t).withLog('And I minimize the telephone  dialog', async() => {
    if (await telephoneDialog.exists) {
      await telephoneDialog.clickMinimizeButton()
    };
  });

  await h(t).withLog('And I add a voicemail from guest', async() => {
    await addOneVoicemailFromAnotherUser(t, caller, callee, app);
  });

  await h(t).withLog('When I open voicemail menu and click "Block number" button', async () => {
    await voicemailItemFromGuest.hoverSelf();
    await voicemailItemFromGuest.openMoreMenu();
  });

  const BlockNumberDialog = app.homePage.blockNumberDialog;

  await h(t).withLog('Then the text "Block number" should be displayed', async () => {
    await t.expect(voicemailItemFromGuest.blockButton.exists).ok;
  });

  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailBlockNumber'} );

  await h(t).withLog('When I click voicemail "Block Number" button and check "Block number" dialog', async () => {
    await voicemailItemFromGuest.clickBlockButton();
  });

  await h(t).withLog('Then "Block Number" dialog should be displayed', async () => {
    await t.expect(BlockNumberDialog.cancelButton.exists).ok;
  });

  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailBlockNumberDialog'} );

  await h(t).withLog('When I click voicemail "Block Number" button', async () => {
    await BlockNumberDialog.clickBlockButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailBlockSuccessToast'} );

  await h(t).withLog('When I open voicemail menu', async () => {
    await t.wait(5000);
    await voicemailItemFromGuest.openMoreMenu();
  });

  await h(t).withLog('Then the text "Unblock number" should be displayed', async () => {
    await t.expect(voicemailItemFromGuest.unblockButton.exists).ok;
  });

  await h(t).log('And I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailUnblockNumber'} );

  await h(t).withLog('When I click voicemail "Unblock Number" button and check notification', async () => {
    await voicemailItemFromGuest.clickUnblockButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:'Jupiter_Phone_VoicemailUnblockSuccessToast'} );

});
