/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-23 13:10:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { ConversationListItemCell } from '../ConversationListItemCell';
import StoreViewModel from '@/store/ViewModel';

const ConversationListItemModule = require.requireActual(
  'ui-components/molecules/ConversationList/ConversationListItem',
);

const vmStub = {
  dispose: () => {},
  extendProps: (props: any) => props,
} as StoreViewModel;

ConversationListItemModule.ConversationListItem = ({
  title,
  status,
  umiVariant,
}: {
  title: string;
  status?: string;
  umiVariant: string;
}) => (
  <div>
    {status ? <div>{status}</div> : null}
    {`${title}, ${umiVariant}`}
  </div>
);
jest.doMock(
  'ui-components/molecules/ConversationList/ConversationListItem',
  ConversationListItemModule,
);

jest.mock('../../../utils/groupName', () => ({
  getGroupName: jest.fn().mockReturnValue('some group name'),
}));
const listen = () => {};
const testFunction = () => {};
describe('ConversationListItemCell', () => {
  beforeAll(() => {});

  it('ConversationListItem should receive title from getGroupName', () => {
    const mockGetEntity = () => ({
      id: 1,
      isTeam: false,
      members: [1],
    });
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          history={{ listen } as any}
          location={{} as any}
          match={{} as any}
          getEntity={mockGetEntity as any}
          vm={vmStub}
          getSingleEntity={testFunction as any}
          getGlobalValue={testFunction as any}
        />,
      ).html(),
    ).toBe('<div>some group name, count</div>');
  });

  it('ConversationListItem should receive correct status', () => {
    const mockGetEntity = (type: string) => {
      if (type === 'group') {
        return {
          id: 1,
          isTeam: false,
          members: [1, 2],
        };
      }
      if (type === 'presence') {
        return {
          id: 2,
          presence: 'online',
        };
      }
      return {};
    };
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          currentUserId={1}
          history={{ listen } as any}
          location={{} as any}
          match={{} as any}
          getEntity={mockGetEntity as any}
          vm={vmStub}
          getSingleEntity={testFunction as any}
          getGlobalValue={testFunction as any}
        />,
      ).html(),
    ).toBe('<div><div>online</div>some group name, count</div>');
  });

  it('ConversationListItem should receive umiVariant=auto if group is team', () => {
    const mockGetEntity = (type: string) => {
      if (type === 'group') {
        return {
          id: 1,
          isTeam: true,
          members: [1, 2],
        };
      }
      if (type === 'presence') {
        return {
          id: 2,
          presence: 'online',
        };
      }
      return {};
    };
    expect(
      mount(
        <ConversationListItemCell
          id={1}
          key={1}
          entityName={'group'}
          history={{ listen } as any}
          location={{} as any}
          match={{} as any}
          getEntity={mockGetEntity as any}
          vm={vmStub}
          getSingleEntity={testFunction as any}
          getGlobalValue={testFunction as any}
        />,
      ).html(),
    ).toBe('<div>some group name, auto</div>');
  });
});
