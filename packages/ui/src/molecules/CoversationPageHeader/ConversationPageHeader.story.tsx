/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:24
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import backgrounds from '@storybook/addon-backgrounds';
import { text } from '@storybook/addon-knobs/react';
import ConversationPageHeader from '.';
import { JuiButton } from '../../atoms/Button';
import { JuiIconButton } from '../IconButton/index';

const StyledIconButton = styled(JuiIconButton)``;
const getTitleKnob = () => text('title', 'Global UXD');
storiesOf('Molecules/ConversationPageHeader 🔜', module)
  .addDecorator(
    backgrounds([{ name: 'slide-background', value: '#f3f3f3', default: true }]),
  )
  .addWithJSX('with button bars', withInfo(``)(() => {
    const LeftButtonBar = styled.div`
      white-space: nowrap;
      flex-wrap: nowrap;
      ${StyledIconButton} + ${StyledIconButton} {
        margin-left: 12px;
      }
    `;
    const leftIconBar = (
      <LeftButtonBar>
        <StyledIconButton size="small" tooltipTitle="favorite">star_border</StyledIconButton>
        <StyledIconButton size="small" tooltipTitle="like">favorite_border</StyledIconButton>
        <StyledIconButton size="small">notifications_none</StyledIconButton>
      </LeftButtonBar>
    );
    const RightButtonBar = styled.div`
      white-space: nowrap;
      flex-wrap: nowrap;
    `;
    const RightIconBar = (props: any) => (
      <RightButtonBar>
        <StyledIconButton>local_phone</StyledIconButton>
        <StyledIconButton>favorite</StyledIconButton>
        <StyledIconButton>favorite</StyledIconButton>
      </RightButtonBar>
    );
    return (
      <ConversationPageHeader
        title={getTitleKnob()}
        SubTitle={leftIconBar}
        Right={RightIconBar}
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
        <StyledIconButton>local_phone</StyledIconButton>
        <StyledIconButton>favorite</StyledIconButton>
        <StyledIconButton>favorite</StyledIconButton>
      </RightButtonBar>
    );
    return <ConversationPageHeader title={getTitleKnob()} Right={iconBar} />;
  }))
  .addWithJSX('title only', withInfo(``)(() => {
    return <ConversationPageHeader title={getTitleKnob()} />;
  }))
  .addWithJSX('with right text button', withInfo(``)(() => {
    const textButton = <JuiButton variant="text" color="primary">Button</JuiButton>;
    return <ConversationPageHeader title={getTitleKnob()} Right={textButton} />;
  }));
