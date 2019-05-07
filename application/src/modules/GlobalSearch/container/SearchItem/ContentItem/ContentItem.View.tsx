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

type ContentItemProps = ViewProps & WithTranslation & { automationId?: string };

@observer
class ContentItemComponent extends React.Component<ContentItemProps> {
  render() {
    const {
      terms,
      onMouseEnter,
      onMouseLeave,
      hovered,
      contentText,
      onClick,
      automationId,
    } = this.props;

    return (
      <JuiSearchItem
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hovered={hovered}
        onClick={onClick}
        Avatar={
          <JuiIconography iconSize="medium" iconColor={['grey', '500']}>
            search
          </JuiIconography>}
        value={contentText.get()}
        terms={terms}
        data-test-automation-id={automationId}
      />
    );
  }
}

const ContentItemView = withTranslation('translations')(ContentItemComponent);

export { ContentItemView };
