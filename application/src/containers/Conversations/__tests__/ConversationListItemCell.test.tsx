/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-23 13:10:58
 * Copyright © RingCentral. All rights reserved.
 */
import MultiEntityMapStore from '../../../store/base/MultiEntityMapStore';
import React from 'react';
import { mount } from 'enzyme';
import ConversationListItemCell from '../ConversationListItemCell';
import storageManager from '../../../store';
import { groupFactory } from 'sdk/src/__tests__/factories';

const uiComponentModule = require.requireActual('ui-components');
uiComponentModule.ConversationListItem = ({ title, status }: { title: string, status?: string }) => (
  <div>
    {status ? <div>{status}</div> : null}
    {title}
  </div>
);
jest.doMock('ui-components', uiComponentModule);

const groupStore = storageManager.getEntityMapStore('group') as MultiEntityMapStore;
const personStore = storageManager.getEntityMapStore('person') as MultiEntityMapStore;
const presenceStore = storageManager.getEntityMapStore('presence') as MultiEntityMapStore;

const currentUser = {
  id: 1,
  first_name: 'Chris',
  last_name: 'zhan',
};
const groupId = 1;
const people = {
  1: currentUser,
  2: {
    id: 2,
    first_name: 'jeffrey',
    last_name: 'huang',
  },
  3: {
    id: 3,
    first_name: 'andy',
  },
  4: {
    id: 4,
    last_name: 'hu',
  },
  5: {
    id: 5,
    email: 'lip.wang@ringcentral.com',
  },
  6: {
    id: 6,
    first_name: 'Shining',
    last_name: 'Miao',
  },
  7: {
    id: 7,
    first_name: '01David',
  },
  8: {
    id: 8,
    last_name: '+Casey',
  },
  9: {
    id: 9,
    email: '+chris.zhan@ringcentral.com',
  },
  10: {
    id: 10,
    email: '01david@rc.come',
  },
};

const renderHtml = () => {
  const result = mount(
    <ConversationListItemCell
      id={groupId}
      key={groupId}
      entityName={'group'}
      currentUserId={currentUser.id}
    />,
  );
  return result.html();
};

describe('ConversationListItem', () => {
  beforeAll(() => {
    personStore.batchSet(Object.values(people));
  });
  describe('Direct Message List Item', () => {
    describe('1:1 conversations', () => {
      it('should display name (me) and presence if online', () => {
        presenceStore.set({ id: 1, presence: 'online' });
        groupStore.set(groupFactory.build({
          id: groupId,
          is_team: false,
          members: [currentUser.id],
        }));
        const html = renderHtml();
        expect(html).toEqual('<div><div>online</div>Chris Zhan (me)</div>');
      });

      it('should display first_name and last_name for 1:1 conversation', () => {
        groupStore.set(groupFactory.build({
          id: groupId,
          is_team: false,
          members: [currentUser.id, 2],
        }));
        const html = renderHtml();
        expect(html).toEqual('<div>Jeffrey Huang</div>');
      });

      it('should display first name if other member has only first_name', () => {
        groupStore.set(groupFactory.build({
          id: groupId,
          is_team: false,
          members: [currentUser.id, 3],
        }));
        const html = renderHtml();
        expect(html).toEqual('<div>Andy</div>');
      });

      it('should display last name if other member has only last_name', () => {
        groupStore.set(groupFactory.build({
          id: groupId,
          is_team: false,
          members: [currentUser.id, 4],
        }));
        const html = renderHtml();
        expect(html).toEqual('<div>Hu</div>');
      });

      it('should display email if other member has no first_name nor last_name', () => {
        groupStore.set(groupFactory.build({
          id: groupId,
          is_team: false,
          members: [currentUser.id, 5],
        }));
        const html = renderHtml();
        expect(html).toEqual('<div>lip.wang@ringcentral.com</div>');
      });
    });

    describe('group conversations', () => {
      it(
        `should display first name if user has first_name and last_name,
      last name if user has only last_name,
      email if user has neither first_name nor last_name,
      separated by comma, in right order`,
        () => {
          groupStore.set(groupFactory.build({
            id: groupId,
            is_team: false,
            members: [currentUser.id, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          }));
          const html = renderHtml();
          expect(html).toEqual('<div>Andy, Hu, Jeffrey, Shining, 01David, +Casey, lip.wang@ringcentral.com, 01david@rc.come, +chris.zhan@ringcentral.com</div>');
        });
    });
  });
});
