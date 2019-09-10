import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';
import { WebphoneSession } from 'webphone-client';


fixture('Call/ActiveCallRecordFailed')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Park for an active call', ['P2', 'Call', 'ActiveCallRecordFailed1', 'V1.6', 'Jenny.Cai']), async (t) => {
  let loginUser = h(t).rcData.mainCompany.users[4];
  let otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  if (SITE_ENV == 'XMN-UP') {
    loginUser.company.number = '(888) 231-2542';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';

    otherUser.company.number = '(888) 231-2542';
    otherUser.extension = '102';
    otherUser.password = 'Test!123';
  } else {
    //GLP-CI1-XMN
    loginUser.company.number = '(866) 214-2268';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';

    otherUser.company.number = '(833) 214-1894';
    otherUser.extension = '102';
     otherUser.password = 'Test!123';
  }


  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let session: WebphoneSession;
  await h(t).withLog(`And ${otherUser.company.number}#${otherUser.extension} login webphone and make a call to ${loginUser.company.number}#${loginUser.extension}`, async () => {
    session = await h(t).newWebphoneSession(otherUser);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  })

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive incoming call and click Answer button', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
  })

  await h(t).withLog('And I click Record', async () => {
    await t.wait(1000);
    await t.click(telephonyDialog.recordToggle);
  })

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Call_ActiveCallRecordFailed_01'})

  await h(t).withLog('End the call', async () => {
    await session.hangup();
  })
});

test(formalName('Check Park for an active call', ['P2', 'Call', 'ActiveCallRecordFailed2', 'V1.6', 'Jenny.Cai']), async (t) => {
  let loginUser = h(t).rcData.mainCompany.users[4];
  let otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  //Need account pool support
  //For now, use fixed account to run this case

  if (SITE_ENV == 'XMN-UP') {
    loginUser.company.number = '(888) 231-2632';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';

    otherUser.company.number = '(888) 231-2632';
    otherUser.extension = '102';
    otherUser.password = 'Test!123';
  } else {
    //GLP-CI1-XMN
    loginUser.company.number = '(877) 214-6307';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';

    otherUser.company.number = '(877) 214-6307';
    otherUser.extension = '102';
    otherUser.password = 'Test!123';
  }

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let session: WebphoneSession;
  await h(t).withLog(`And ${otherUser.company.number}#${otherUser.extension} login webphone and make a call to ${loginUser.company.number}#${loginUser.extension}`, async () => {
    session = await h(t).newWebphoneSession(otherUser);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  })

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive incoming call and click Answer button', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
  })

  await h(t).withLog('And I click Record', async () => {
    await t.wait(1000);
    await t.click(telephonyDialog.recordToggle);
    await t.wait(1000);
  })

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Call_ActiveCallRecordFailed_02'})

  await h(t).withLog('End the call', async () => {
    await session.hangup();
  })
});
