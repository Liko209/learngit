/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';

import { Section } from './Section';
import { LeftRailViewProps } from './types';
import { toTitleCase } from '@/utils';
import { JuiLeftRailStickyTop } from 'jui/pattern/LeftRail/LeftRail';
import { translate, WithNamespaces } from 'react-i18next';
import styled from 'jui/src/foundation/styled-components';

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LeftRailViewComponent = (props: LeftRailViewProps & WithNamespaces) => {
  return (
    <Wrapper>
      <JuiLeftRailStickyTop>
        {props.filters.map((filter, index) => [
          index ? <JuiDivider key="divider" /> : null,
          <JuiConversationListFilter
            data-test-automation-id="unreadOnlyToggler"
            checked={filter.value}
            key={filter.label}
            label={toTitleCase(props.t(filter.label))}
            onChange={filter.onChange}
          />,
        ])}
      </JuiLeftRailStickyTop>
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
