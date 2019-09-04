/*
 * @Author: allen.lian
 * @Date: 2019-08-29 17:28:12
 * Copyright © RingCentral. All rights reserved.
 */


import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';

fixture('Contacts/Call')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
    priority: ['P1'],
    caseIds: ['JPT-2877'],
    maintainers: ['Allen.Lian'],
    keywords: ['AllContacts']
})('Open profile from the contacts', async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const callee = users[5];
  
    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
        step.initMetadata({
          number: callee.company.number,
          extension: callee.extension,
        })
        await h(t).directLoginWithUser(SITE_URL, callee);
        await app.homePage.ensureLoaded();
      });

      const allcontactsPage = app.homePage.contactsTab.allContactsPage;
      await h(t).withLog('When I click Contacts entry of leftPanel and click all contacts entry', async () => {
        await app.homePage.leftPanel.contactsEntry.enter();
        await app.homePage.contactsTab.allContactsEntry.enter();
      });
    
      await h(t).withLog('Then all contacts page should be open', async () => {
        await allcontactsPage.ensureLoaded();
      });

      const allcontactsItem = allcontactsPage.allcontactsItemByNth(0);
      const allcontactsId = await allcontactsItem.id;
      const contactsName = await allcontactsItem.callerName.textContent;
    
      await h(t).withLog('When I click Call button', async (step) => {
        step.setMetadata('id', allcontactsId)
        await allcontactsItem.hoverSelf();
        await allcontactsItem.ClickItem();
      });
    
      const profileDialog = app.homePage.profileDialog;

      await h(t).withLog(`Then profile name is correct`, async () => {
        await t.expect(profileDialog.name.textContent).eql(contactsName);
      });

      await profileDialog.ensureLoaded();
    }
);
    