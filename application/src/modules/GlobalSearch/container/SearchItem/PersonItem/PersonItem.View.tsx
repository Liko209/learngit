/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { Avatar } from '@/containers/Avatar';
import { Call } from '@/modules/telephony';

import { ViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

@observer
class PersonItemComponent extends React.Component<ViewProps & WithTranslation> {
  goToConversation = async () => {
    const { goToConversation, person } = this.props;
    await goToConversation(person.id);
  }

  handleGoToConversation = (evt: React.MouseEvent) => {
    const { addRecentRecord, onClear, onClose } = this.props;
    evt.stopPropagation();
    addRecentRecord();
    this.goToConversation();
    onClear();
    onClose();
  }

  render() {
    const {
      t,
      title,
      person,
      terms,
      onMouseEnter,
      onMouseLeave,
      hovered,
      onClose,
    } = this.props;
    const { id, userDisplayName, deactivated } = person;

    if (deactivated) {
      return null;
    }
    const goToConversationIcon = (
      <JuiIconButton
        data-test-automation-id="goToConversationIcon"
        tooltipTitle={t('message.message')}
        onClick={this.handleGoToConversation}
        variant="plain"
        size="small"
        key="search item go to conversation icon"
      >
        messages
      </JuiIconButton>
    );
    const callIcon = (
      <Call
        key="search item call icon"
        variant="plain"
        id={id}
        onClick={onClose}
        size="small"
      />
    );

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        key={id}
        onClick={this.handleGoToConversation}
        Avatar={<Avatar uid={id} size="small" />}
        value={userDisplayName}
        terms={terms}
        data-test-automation-id={`search-${title}-item`}
        Actions={[goToConversationIcon, callIcon]}
        isPrivate={false}
        isJoined={false}
      />
    );
  }
}

const PersonItemView = withTranslation('translations')(PersonItemComponent);

export { PersonItemView };
