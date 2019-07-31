/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { Component } from 'react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';
import { JuiConversationListTop } from 'jui/pattern/ConversationList/ConversationListTop';

import { Section } from './Section';
import { LeftRailViewProps } from './types';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
  JuiLeftRailMainSection
} from 'jui/pattern/LeftRail/LeftRail';
import history from '@/history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { POST_LIST_TYPE } from '../PostListPage/types';

@observer
class LeftRailViewComponent extends Component<
  LeftRailViewProps & WithTranslation
> {
  onEntryClick = (type: POST_LIST_TYPE) => {
    history.push(`/messages/${type}`);
  };

  render() {
    const { filters, entries, sections, currentPostListType, t } = this.props;
    return (
      <JuiLeftRail data-test-automation-id="leftRail">
        <JuiLeftRailStickyTop>
          {entries.map(entry => (
            <JuiConversationListTop
              data-test-automation-id={entry.testId}
              key={entry.title}
              title={t(entry.title)}
              icon={entry.icon}
              iconColor={entry.iconColor}
              selected={entry.type === currentPostListType}
              onClick={() => {
                this.onEntryClick(entry.type);
              }}
            />
          ))}
          <JuiDivider key="divider-filters" />
        </JuiLeftRailStickyTop>
        {filters.map(filter => [
          <JuiConversationListFilter
            data-test-automation-id="unreadOnlyToggler"
            checked={filter.value}
            key={filter.label}
            label={t(filter.label).toUpperCase()}
            onChange={filter.onChange}
          />
        ])}
        <JuiLeftRailMainSection>
          {sections.map((type, index, array) => [
            <Section
              key={type}
              type={type}
              isLast={index === array.length - 1}
            />
          ])}
        </JuiLeftRailMainSection>
      </JuiLeftRail>
    );
  }
}

const LeftRailView = withTranslation('translations')(LeftRailViewComponent);

export { LeftRailView };
