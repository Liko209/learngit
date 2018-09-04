/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-23 13:10:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import storeManager from '../../../store';
import { ConversationListItemCell } from '../ConversationListItemCell';

const ConversationListItemModule = require.requireActual('ui-components/molecules/ConversationList/ConversationListItem');
ConversationListItemModule.ConversationListItem = ({ title, status, umiVariant }: { title: string, status?: string, umiVariant: string }) => (
  <div>
    {status ? <div>{status}</div> : null}
    {`${title}, ${umiVariant}`}
  </div>
);
jest.doMock('ui-components/molecules/ConversationList/ConversationListItem', ConversationListItemModule);

jest.mock('../../../utils/groupName', () => ({
  getGroupName: jest.fn().mockReturnValue('some group name'),
}));

const groupStore = {
  get: jest.fn(),
};
const presenceStore = {
  get: jest.fn(),
};
describe('ConversationListItemCell', () => {
  beforeAll(() => {
    storeManager.getEntityMapStore = jest.fn((entityName) => {
      switch (entityName) {
        case 'group':
          return groupStore;
        case 'presence':
          return presenceStore;
        default:
          return null;
      }
    });

    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: false,
      members: [1],
    });
  });

  it('ConversationListItem should receive title from getGroupName', () => {
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          history={{} as any}
          location={{} as any}
          match={{} as any}
        />,
      ).html(),
    ).toBe('<div>some group name, count</div>');
  });

  it('ConversationListItem should receive correct status', () => {
    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: false,
      members: [1, 2],
    });
    presenceStore.get.mockReturnValue({
      id: 2,
      presence: 'online',
    });
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          currentUserId={1}
          history={{} as any}
          location={{} as any}
          match={{} as any}
        />,
      ).html(),
    ).toBe('<div><div>online</div>some group name, count</div>');
  });

  it('ConversationListItem should receive umiVariant=auto if group is team', () => {
    groupStore.get.mockReturnValue({
      id: 1,
      isTeam: true,
      members: [1, 2],
    });
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          history={{} as any}
          location={{} as any}
          match={{} as any}
        />,
      ).html(),
    ).toBe('<div>some group name, auto</div>');
  });
});
