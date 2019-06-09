import { formalName } from '../libs/filter';
import { h, H } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../config';

fixture('Accessibility')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.skip(formalName('Accessibility', ['Henry.Xu']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can run accessibility check', async (step) => {
    const zipFile = await h(t).a11yHelper.accessibilityCheck("accessibility-check");
    if (!step.attachments) step.attachments = [];
    step.attachments.push(zipFile);
  })
});
