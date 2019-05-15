// dependency import
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';


// SetupCase before running and teardown case after running
fixture('Folder Name/Case Name')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

// Tag standard – Priority,Case number, Creator must to have

// Case format following Given, When, Then, And
test(formalName(`The title of the test case`, ['P0', 'JPT-XXXX', 'Creator']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];

//Init member from back end API
  await h(t).glip(memberUser).init();
  await h(t).glip(memberUser).resetProfile();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  await h(t).withLog('Given I have condition', async () => {
  });
  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension} `, async () => {
  });
  await h(t).withLog(`When do something`, async () => {
  });
  await h(t).withLog(`And do other things`, async () => {
  });
  await h(t).withLog(`Then the feature should match my expectation`, async () => {
  });
});
