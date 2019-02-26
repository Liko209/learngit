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
import { HotKeys } from 'jui/hoc/HotKeys';
import { ViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

@observer
class PersonItemView extends React.Component<ViewProps, {}> {
  onEnter = () => {
    const { hovered } = this.props;
    if (hovered) {
      this.goToConversation();
    }
  }

  goToConversation = async () => {
    const { goToConversation, person } = this.props;
    await goToConversation(person.id);
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
        size="small"
        color="accent.ash"
        tooltipTitle={i18next.t('message.message')}
        onClick={this.handleGoToConversation}
        variant="plain"
      >
        {'messages'}
      </JuiIconButton>
    );
    return (
      <HotKeys
        keyMap={{
          enter: this.onEnter,
        }}
      >
        <JuiSearchItem
          onMouseEnter={onMouseEnter(sectionIndex, cellIndex)}
          onMouseLeave={onMouseLeave}
          hovered={hovered}
          key={id}
          onClick={this.goToConversation}
          Avatar={<Avatar uid={id} size="small" />}
          value={userDisplayName}
          terms={terms}
          data-test-automation-id={`search-${title}-item`}
          Actions={goToConversationIcon}
          isPrivate={false}
          isJoined={false}
        />
      </HotKeys>
    );
  }
}

export { PersonItemView };
