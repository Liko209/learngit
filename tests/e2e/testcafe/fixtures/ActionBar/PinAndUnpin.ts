/*
 * @Author: Potar.He 
 * @Date: 2019-03-04 17:01:03 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-04 18:19:51
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { BrandTire } from '../../config'
import { IGroup } from '../../v2/models';

fixture('ActionBar/PinAndUnpin')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Click Pin option to pin a post', ['JPT-1264', 'P1', 'Pin', 'Potar.He']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4]
  await h(t).glip(loginUser).init();

  let team = <IGroup> {
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  const app = new AppRoot(t);

  
});
