/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';
import { JuiConversationListSectionHeader } from 'jui/pattern/ConversationList/ConversationListSectionHeader';

import { Section } from './Section';
import { LeftRailViewProps } from './types';
import { toTitleCase } from '@/utils/string';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
  JuiLeftRailMainSection,
} from 'jui/pattern/LeftRail/LeftRail';
import { translate, WithNamespaces } from 'react-i18next';

const LeftRailViewComponent = (props: LeftRailViewProps & WithNamespaces) => {
  return (
    <JuiLeftRail>
      <JuiLeftRailStickyTop>
        {props.filters.map((filter, index) => [
          index ? <JuiDivider key={`divider${index}`} /> : null,
          <JuiConversationListFilter
            data-test-automation-id="unreadOnlyToggler"
            checked={filter.value}
            key={filter.label}
            label={toTitleCase(props.t(filter.label))}
            onChange={filter.onChange}
          />,
        ])}
      </JuiLeftRailStickyTop>
      <JuiDivider key="divider-filters" />
      <JuiLeftRailMainSection>
        {props.entries.map((entry, index) => (
          <JuiConversationListSectionHeader
            data-test-automation-id="entry-mentions"
            key={entry.title}
            title={toTitleCase(props.t(entry.title))}
            icon={entry.icon}
            hideArrow={true}
            selected={entry.selected}
            onClick={entry.onClick}
          />
        ))}
        <JuiDivider key="divider-entries" />
        {props.sections.map((type, index, array) => [
          index ? <JuiDivider key={`divider${index}`} /> : null,
          <Section key={type} type={type} isLast={index === array.length - 1} />,
        ])}
      </JuiLeftRailMainSection>
    </JuiLeftRail>
  );
};

const LeftRailView = translate('Conversations')(LeftRailViewComponent);

export { LeftRailView };
