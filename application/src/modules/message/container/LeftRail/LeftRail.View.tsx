/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiConversationListFilter } from 'jui/pattern/ConversationList/ConversationListFilter';
import { JuiConversationListTop } from 'jui/pattern/ConversationList/ConversationListTop';
import { Section } from './Section';
import { LeftRailViewProps } from './types';
import {
  JuiLeftRail,
  JuiLeftRailStickyTop,
  JuiLeftRailMainSection,
} from 'jui/pattern/LeftRail/LeftRail';
import history from '@/history';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { POST_LIST_TYPE } from '../PostListPage/types';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { SECTION_TYPE } from './Section/types';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { JuiConversationListItemLoader } from 'jui/pattern/ConversationList';

const DISTANCE_FROM_BOTTOM_TO_TRIGGER_LOAD = 300;

@observer
class LeftRailViewComponent extends Component<
  LeftRailViewProps & WithTranslation
> {
  onEntryClick = (type: POST_LIST_TYPE) => {
    history.push(`/messages/${type}`);
  };

  @observable private _loading = false;
  @observable private _teamSectionCollapsed = false;

  componentDidMount() {
    SectionGroupHandler.getInstance().setLeftRailVisible(true);
  }

  componentWillUnmount() {
    SectionGroupHandler.getInstance().setLeftRailVisible(false);
  }

  handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (this._teamSectionCollapsed) return;
    const element = event.currentTarget;
    const hasMore = SectionGroupHandler.getInstance().hasMore(
      SECTION_TYPE.TEAM,
      QUERY_DIRECTION.NEWER,
    );
    if (element) {
      const scrollPassLoadPosition =
        element.scrollHeight - element.scrollTop <=
        element.clientHeight + DISTANCE_FROM_BOTTOM_TO_TRIGGER_LOAD;
      if (scrollPassLoadPosition && !this._loading && hasMore) {
        this._loading = true;
        this._loadGroups();
      }
    }
  };

  private _loadGroups = () => {
    setTimeout(() => {
      SectionGroupHandler.getInstance()
        .fetchPagination(SECTION_TYPE.TEAM)
        .finally(() => {
          this._loading = false;
        });
    });
  };

  handleSectionCollapseChange = (arg: {
    sectionType: SECTION_TYPE;
    value: boolean;
  }) => {
    if (
      arg.sectionType === SECTION_TYPE.TEAM &&
      this._teamSectionCollapsed !== arg.value
    ) {
      this._teamSectionCollapsed = arg.value;
    }
  };

  render() {
    const { filters, entries, sections, currentPostListType, t } = this.props;
    const hasMore = SectionGroupHandler.getInstance().hasMore(
      SECTION_TYPE.TEAM,
      QUERY_DIRECTION.NEWER,
    );
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
          />,
        ])}
        <JuiLeftRailMainSection onScroll={this.handleScroll}>
          {sections.map((type, index, array) => [
            <Section
              key={type}
              type={type}
              onCollapseChange={this.handleSectionCollapseChange}
              isLast={index === array.length - 1}
            />,
          ])}
          {this._loading && hasMore && <JuiConversationListItemLoader />}
        </JuiLeftRailMainSection>
      </JuiLeftRail>
    );
  }
}

const LeftRailView = withTranslation('translations')(LeftRailViewComponent);

export { LeftRailView };
