/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as _ from 'lodash';
import { formalName } from '../libs/filter';
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';

fixture('Telephony')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Call another extension', ['P0', 'MakeCall']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);

  const telephonyPOCPage = app.homePage.telephonyPOCPage;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  // await h(t).withLog(`When I enter extension and click dial button`, async () => {
  //   await telephonyPOCPage.typeExtension(callee.extension);
  //   const session = await h(t).webphone(callee);
  //   console.log(session);
  //   await t.wait(5e3);
  //   await session.preOperate("answerCall", true);
  //   await telephonyPOCPage.clickDial();
  //   // await session.close();
  // });

  await h(t).withLog(`When I call this extension`, async () => {
    const session = await h(t).webphone(callee);
    await t.wait(5e3);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.wait(30e3);
    await session.close();
  });
  

  await h(t).withLog(`And the url should be`, async () => {
    await t.debug();
  });

});
