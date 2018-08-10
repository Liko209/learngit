import * as React from 'react';
import styled from 'styled-components';

import { storiesOf } from '@storybook/react';
// import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';
// import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import { select, number, boolean } from '@storybook/addon-knobs/react';

import { ConversationList } from './ConversationList';
import { ConversationListItem } from './ConversationListItem';

const Wrapper = styled.div`
  padding: 20px;
  width: 100%;
  height: 100%;
  background: #ddd;
`;
const transition = 'all ease 0.15s';
const CenterDecorator = (storyFn: Function) => <Wrapper>{storyFn()}</Wrapper>;

storiesOf('ConversationList', module)
  .addDecorator(CenterDecorator)
  .add('List', withInfo(``)(
    () => {
      const onChange = (event: React.ChangeEvent, v: any) => {
        console.log('change', v);
      };

      const width = select(
        'Width',
        {
          '265px': '265px',
          '320px': '320px',
        },
        '320px',
      );

      return (
        <div style={{ width, transition }}>
          <ConversationList value={0} onChange={onChange}>
            <ConversationListItem status="online" title="Matthew" unreadCount={10} />
            <ConversationListItem
              team={true}
              important={true}
              title="Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello"
              unreadCount={12}
            />
            <ConversationListItem title="Maria" unreadCount={9} />
            <ConversationListItem title="Jupiter Team" unreadCount={0} />
            <ConversationListItem status="away" title="Michael" unreadCount={0} />
            <ConversationListItem status="offline" title="Steve" />
          </ConversationList>
        </div>
      );
    },
  ))
  .add('Item', withInfo(``)(
    () => {

      const width = select(
        'Width',
        {
          '265px': '265px',
          '320px': '320px',
        },
        '320px',
      );

      const status = select(
        'Status',
        {
          online: 'online',
          offline: 'offline',
          away: 'away',
        },
        'online',
      );

      const unreadCount = number('Unread Count', 120);
      const important = boolean('Important', false);
      const isTeam = boolean('isTeam', true);

      let title: string;
      if (isTeam) {
        title = 'Eric, Odeson, Helena, Lip, Valor, Steve, Lyman, Nello';
      } else {
        title = 'Eric';
      }

      return (
        <div style={{ width, transition }}>
          <ConversationListItem
            important={important}
            status={status}
            title={title}
            unreadCount={unreadCount}
            team={isTeam}
          />
        </div>
      );
    },
  ));
