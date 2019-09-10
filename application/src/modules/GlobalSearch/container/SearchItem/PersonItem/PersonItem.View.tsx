/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { container } from 'framework/ioc';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';
import { observer } from 'mobx-react';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';

import { ViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { analyticsCollector } from '@/AnalyticsCollector';

type PersonItemProps = ViewProps & WithTranslation & { automationId?: string };
@observer
class PersonItemComponent extends React.Component<PersonItemProps> {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  goToConversation = async () => {
    const { goToConversation, person } = this.props;
    await goToConversation(person.id);
  };

  handleGoToConversation = (evt: React.MouseEvent) => {
    const { addRecentRecord, onClear, onClose } = this.props;
    evt.stopPropagation();
    addRecentRecord();
    this.goToConversation();
    onClear();
    onClose();
  };

  private _gotoConversationFromHover = (evt: React.MouseEvent) => {
    const { dataTrackingDomain } = this.props;
    analyticsCollector.gotoConversationFromSearch(
      `${dataTrackingDomain}_peopleHoverMessage`,
    );
    this.handleGoToConversation(evt);
  };

  private _gotoConversationFromClick = (evt: React.MouseEvent) => {
    const { dataTrackingDomain } = this.props;
    analyticsCollector.gotoConversationFromSearch(
      `${dataTrackingDomain}_peopleRow`,
    );
    this.handleGoToConversation(evt);
  };

  onCallClose = () => {
    const { addRecentRecord, onClose, dataTrackingDomain } = this.props;
    addRecentRecord();
    onClose();
    analyticsCollector.outboundCallFromPeople(`${dataTrackingDomain}_people`);
  };

  render() {
    const { extensions } = this._globalSearchStore;

    const {
      t,
      person,
      terms,
      onMouseEnter,
      onMouseLeave,
      hovered,
      automationId,
    } = this.props;
    const { id, userDisplayName, deactivated } = person;

    if (deactivated) {
      return null;
    }
    const goToConversationIcon = (
      <JuiIconButton
        data-test-automation-id="goToConversationIcon"
        tooltipTitle={t('message.message')}
        onClick={this._gotoConversationFromHover}
        variant="plain"
        size="small"
        key="search item go to conversation icon"
      >
        messages
      </JuiIconButton>
    );
    const callIcon = extensions['searchItem']
      ? [...extensions['searchItem']].map(
          (Extension: React.ComponentType<any>) => (
            <Extension
              key={`GLOBAL_SEARCH_EXTENSION_${Extension.displayName}`}
              variant="plain"
              id={id}
              onCallSuccess={this.onCallClose}
              size="small"
            />
          ),
        )
      : null;

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        key={id}
        onClick={this._gotoConversationFromClick}
        Avatar={<Avatar uid={id} size="small" />}
        value={userDisplayName}
        terms={terms}
        data-test-automation-id={automationId}
        Actions={[goToConversationIcon, callIcon]}
        isPrivate={false}
        isJoined={false}
        joinedStatusText={t('people.team.joinedStatus')}
      />
    );
  }
}

const PersonItemView = withTranslation('translations')(PersonItemComponent);

export { PersonItemView };
