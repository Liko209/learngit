/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import backgrounds from '@storybook/addon-backgrounds';
import { text } from '@storybook/addon-knobs/react';
import ConversationPageHeader from '.';
import { Button } from '../Button';
import { IconButton } from '../IconButton/index';

const getTitleKnob = () => text('title', 'Global UXD');
storiesOf('Page Header (Conversation)', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
)
  .addWithJSX('with button bars', withInfo(``)(() => {
    const LeftButtonBar = styled.div`
      white-space: nowrap;
      flex-wrap: nowrap;
      ${IconButton} + ${IconButton} {
        margin-left: 12px;
      }
    `;
    const leftIconBar = (
      <LeftButtonBar>
        <IconButton size="small" tooltipTitle="favorite">star_border</IconButton>
        <IconButton size="small" tooltipTitle="like">favorite_border</IconButton>
        <IconButton size="small">notifications_none</IconButton>
      </LeftButtonBar>
    );
    const RightButtonBar = styled.div`
      white-space: nowrap;
      flex-wrap: nowrap;
    `;
    const rightIconBar = (
      <RightButtonBar>
        <IconButton>local_phone</IconButton>
        <IconButton>favorite</IconButton>
        <IconButton>favorite</IconButton>
      </RightButtonBar>
    );
    return (
      <ConversationPageHeader
        title={getTitleKnob()}
        subTitleSlot={leftIconBar}
        rightSlot={rightIconBar}
      />
    );
  }))
  .addWithJSX('with right button bar', withInfo(``)(() => {
    const RightButtonBar = styled.div`
      white-space: nowrap;
      flex-wrap: nowrap;
    `;
    const iconBar = (
      <RightButtonBar>
        <IconButton>local_phone</IconButton>
        <IconButton>favorite</IconButton>
        <IconButton>favorite</IconButton>
      </RightButtonBar>
    );
    return <ConversationPageHeader title={getTitleKnob()} rightSlot={iconBar} />;
  }))
  .addWithJSX('title only', withInfo(``)(() => {
    return <ConversationPageHeader title={getTitleKnob()} />;
  }))
  .addWithJSX('with right text button', withInfo(``)(() => {
    const textButton = <Button variant="text" color="primary">Button</Button>;
    return <ConversationPageHeader title={getTitleKnob()} rightSlot={textButton} />;
  }));
