/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:08
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from './BasePage';
import { Selector } from 'testcafe';
import { GroupAPI, SDK } from '../libs/sdk';
import { SDK_ENV } from '../config';

type ISectionName = 'faviourites' |'teams' | 'people';
interface ICredential {
  password:string;
  username: string;
  extension?: string;
}
export class MessagePage extends BasePage {
  constructor(props:TestController) {
    super(props);
  }

  sectionHeader(name:ISectionName): Selector {
    return Selector(`[data-anchor=${name}]`);
  }
  nthTeamTab(n:number) {
    return Selector(`[data-anchor=team] li.menuitem`).nth(n);
  }
  get environmentSelector(): Selector {
    return Selector('select');
  }

  get environmentOption(): Selector {
    return this.environmentSelector.find('option');
  }

  setupSDK(userCredentials:ICredential) {
    return this.chain(async t =>
      new SDK(SDK_ENV).platform().login(userCredentials),
    );
  }

  createTeamByAPI(creatorId:number, name:string) {
    return this.chain(async t =>  GroupAPI.createTeam(

      { set_abbreviation:name,
        privacy:'private',
        description:'',
        members:[creatorId],
        creator_id:creatorId,
        permissions: {
          admin: {
            uids: [creatorId],
          },
          user: {
            uids: [],
            level: 35,
          },
        },
        is_new:true,
        is_team:true,
        is_public:false }));
  }

  modifyTeamNameByApi(teamId:number, name:string) {
    return  this.chain(async t =>  console.log(await GroupAPI.modifyGroupById(
      teamId,
      { set_abbreviation: name })));
  }

  nthTeamNameEquals(order:number, name:string) {
    return this.chain(async t =>
      console.log(await t.expect(this.nthTeamTab(order).textContent).eql(name)));
  }
}
