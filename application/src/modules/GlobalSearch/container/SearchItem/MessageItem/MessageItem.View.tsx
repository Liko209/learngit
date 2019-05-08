/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSearchItem } from 'jui/pattern/SearchBar';
import { JuiIconography } from 'jui/foundation/Iconography';

import { ViewProps } from './types';

@observer
class MessageItemComponent extends React.Component<
  ViewProps & WithTranslation
> {
  render() {
    const {
      terms,
      onMouseEnter,
      onMouseLeave,
      hovered,
      onClick,
      groupName,
      group,
    } = this.props;

    const groupId = group ? group.id : '';

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        onClick={onClick}
        Avatar={
          <JuiIconography iconSize="medium" iconColor={['grey', '500']}>
            history
          </JuiIconography>}
        value={groupName.get()}
        terms={terms}
        data-test-automation-id="search-message-item"
        data-id={groupId}
      />
    );
  }
}

const MessageItemView = withTranslation('translations')(MessageItemComponent);

export { MessageItemView };
