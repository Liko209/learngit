import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";

fixture('Navigation/Navigation').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip',['P0','Navigation','V1.4','Sean']),async(t)=>{
  const loginUser=h(t).rcData.mainCompany.users[0];
  const app=new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL,loginUser);
    await app.homePage.ensureLoaded();
  });
  const leftPanelEntry=app.homePage.leftPanel;
  await h(t).withLog('When I click menu button',async()=>{
    await t.click(leftPanelEntry.toggleButton);
  })
  await h(t).withLog('And I hover menu button',async()=>{
    await t.hover(leftPanelEntry.toggleButton);
  })
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_Navigation'})
})
