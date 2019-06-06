import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Phone/IncomingCall')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Called by another extension from webphone', ['P2', 'Phone', 'IncomingCall' ,'Hank.Huang']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[5];
  const callee = h(t).rcData.mainCompany.users[6];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('When the other user make a phone call to me', async () => {
    const session = await h(t).newWebphoneSession(callee);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });
  await h(t).withLog('And I hover send to voicemail button', async () => {
    await telephonyDialog.waitUntilVisible(telephonyDialog.sendToVoiceMailButton);
    await telephonyDialog.hoverSendToVoiceMailButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_SendToVoicemail' });

  await h(t).withLog('When I hover answer button', async () => {
    await telephonyDialog.hoverAnswerButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_Answer' });

  await h(t).withLog('When I hover close button', async () => {
    await telephonyDialog.hoverIgnoreButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_IgnoreTheCall' });
});
