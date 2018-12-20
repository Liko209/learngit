import { formalName } from '../libs/filter';
import { h, H } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL } from '../config';

fixture('Accessibility')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Accessibility', ['FIJI-1323']), async (t) => {
  const user = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can run accessibility check', async (step) => {
    const zipFile = await h(t).a11yHelper.accessibilityCheck("accessibility-check");
    if (!step.attachments) step.attachments = [];
    step.attachments.push(zipFile);
  })
});
