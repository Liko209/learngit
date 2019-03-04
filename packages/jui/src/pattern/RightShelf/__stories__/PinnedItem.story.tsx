import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';
import { JuiPinnedCell, JuiPinnedItemProps } from '../PinnedItem';

storiesOf('Pattern/ConversationRightShelf', module).add('PinnedItem', () => {
  // const t = text('text', 'No files shared yet');
  const content = text(
    'content',
    'Files that get shared in your conversation automatically show up here.',
  );
  const Wrapper = styled.div`
    width: 268px;
    background: white;
  `;
  // type ItemConfig = {
  //   icon: string;
  //   text: string;
  // };
  const itemData1: JuiPinnedItemProps[] = [
    {
      id: 123,
      icon: 'events',
      isFile: false,
      text: 'This is an event',
    },
  ];
  const itemData2: JuiPinnedItemProps[] = [
    {
      id: 1234,
      icon: 'image_preview',
      isFile: true,
      text: 'This is an event',
    },
    {
      id: 1235,
      icon: 'tasks',
      isFile: false,
      text: 'This is an task',
    },
  ];
  const itemData3: JuiPinnedItemProps[] = [];
  const itemData4: JuiPinnedItemProps[] = [
    {
      id: 126,
      icon: 'image_preview',
      isFile: true,
      text: 'This is an event',
    },
    {
      id: 127,
      icon: 'tasks',
      isFile: false,
      text: 'This is an task',
    },
    {
      id: 128,
      isFile: false,
      icon: 'tasks',
      text: 'This is an task',
    },
    {
      id: 129,
      icon: 'tasks',
      isFile: false,
      text: 'This is an task',
    },
    {
      id: 1210,
      icon: 'tasks',
      isFile: false,
      text: 'This is an task',
    },
    {
      id: 1211,
      icon: 'tasks',
      isFile: false,
      text: 'This is an task',
    },
  ];
  function genCell(data: JuiPinnedItemProps[]) {
    return (
      <Wrapper>
        <JuiPinnedCell
          postId={123}
          creator="Virginia Gill"
          createTime="8/8/2019"
          content={content}
          itemLen={data.length}
        />
      </Wrapper>
    );
  }
  return (
    <div>
      {genCell(itemData1)}
      {genCell(itemData2)}
      {genCell(itemData3)}
      {genCell(itemData4)}
    </div>
  );
});
