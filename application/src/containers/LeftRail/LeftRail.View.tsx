/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from 'jui/foundation/styled-components';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';

import { Section } from './Section';
import { LeftRailViewProps } from './types';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LeftRailViewComponent = (
  props: LeftRailViewProps & { t: TranslationFunction },
) => {
  return (
    <Wrapper>
      {props.filters.map((filter, index) => [
        index ? <JuiDivider key="divider" /> : null,
        <JuiConversationListFilter
          checked={filter.value}
          key={filter.label}
          label={props.t(filter.label)}
          onChange={filter.onChange}
        />,
      ])}
      <JuiDivider key="divider" />
      {props.sections.map((type, index, array) => [
        index ? <JuiDivider key="divider" /> : null,
        <Section key={type} type={type} isLast={index === array.length - 1} />,
      ])}
    </Wrapper>
  );
};

const LeftRailView = translate('Conversations')(LeftRailViewComponent);

export { LeftRailView };
