/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { observer } from 'mobx-react';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';
// import { HotKeys } from 'jui/hoc/HotKeys';
import { ViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

@observer
class PersonItemView extends React.Component<ViewProps, {}> {
  goToConversation = async () => {
    const { goToConversation, person } = this.props;
    await goToConversation(person.id);
  }

  onClick = () => {
    const { addRecentRecord } = this.props;
    addRecentRecord();
  }

  handleGoToConversation = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    this.goToConversation();
  }

  render() {
    const {
      title,
      person,
      terms,
      cellIndex,
      onMouseEnter,
      onMouseLeave,
      sectionIndex,
      hovered,
    } = this.props;
    const { id, userDisplayName, deactivated } = person;

    if (deactivated) {
      return null;
    }
    const goToConversationIcon = (
      <JuiIconButton
        data-test-automation-id="goToConversationIcon"
        tooltipTitle={i18next.t('message.message')}
        onClick={this.handleGoToConversation}
        variant="plain"
        size="small"
      >
        messages
      </JuiIconButton>
    );
    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        key={id}
        onClick={this.onClick}
        Avatar={<Avatar uid={id} size="small" />}
        value={userDisplayName}
        terms={terms}
        data-test-automation-id={`search-${title}-item`}
        Actions={goToConversationIcon}
        isPrivate={false}
        isJoined={false}
      />
    );
  }
}

export { PersonItemView };
