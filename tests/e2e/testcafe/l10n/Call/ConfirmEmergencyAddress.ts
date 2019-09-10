import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";

fixture('Call/ConfirmEmergencyAddress')
  .beforeEach(setupCase(BrandTire.DID_WITH_MULTI_REGIONS))
  .afterEach(teardownCase());

  test(formalName('Check confirm emergency address toast and alert',['P2','Call', 'ConfirmEmergencyAddress', 'V1.7', 'Hank.Huang']),async (t) => {
    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
    });

    await h(t).withLog('Then emergency confirm from entry is displayed', async () => {
      await t.expect(app.homePage.emergencyConfirmFromEntry.exists).ok();
    });
    await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_Call_ConfirmEmergencyAddressToast' });

    await h(t).withLog('When I click "Dialer" button', async () => {
      await t.click(app.homePage.dialpadButton);
    });
    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Call_ConfirmEmergencyAddressAlert' });

  });
