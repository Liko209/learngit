/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from './BasePage';
import { GroupAPI } from '../libs/sdk';
import { Selector } from 'testcafe';

const favoriteSection = ReactSelector('FavoriteSection');
const favoriteSectionHeader = favoriteSection.findReact('ConversationListSectionHeader');
const favoriteSectionCollapse = favoriteSection.findReact('Collapse');

class MainPage extends BasePage {
  favoriteSection: Selector = favoriteSection;
  favoriteSectionHeader: Selector = favoriteSectionHeader;
  favoriteSectionCollapse: Selector = favoriteSectionCollapse;

  nthTeamInPanel(order:number) {
    return ReactSelector('ConversationListSection').withProps({ title:'Teams' }).findReact('ConversationListItemCell').nth(order);
  }
  createTeamByAPI(creatorId:number, name:string) {
    const args =  { set_abbreviation:name,
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
      is_public:false,
    };
    return this.chain(async t =>  GroupAPI.createTeam(args));
  }

  modifyTeamNameByApi(name:string) {
    return  this.chain(async t => {
      const { props:{ id:teamId } } = await this.nthTeamInPanel(0).getReact();
      await GroupAPI.modifyGroupById(
        teamId,
        { set_abbreviation: name },
      );
    },
     );
  }

  nthTeamNameEquals(order:number, name:string) {
    return this.chain(async (t) => {
      const ele = ReactSelector('ConversationListSection').find('div').findReact('ConversationListItem').withProps({ title:name });
      await t.wait(3000).expect(ele.exists).ok();
    });
  }

}

export { MainPage };
