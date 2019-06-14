/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-27 16:13:35
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components/Menus';
import { ViewProps } from './types';

type Props = ViewProps & WithTranslation;

@observer
class ReplyViewComponent extends React.Component<Props> {
  handleClick = () => {
    const { directReply } = this.props;
    directReply();
  }
  render() {
    const { t } = this.props;
    return (
      <JuiMenuItem
        onClick={this.handleClick}
        data-test-automation-id="telephony-reply-menu-item"
      >
        {t('telephony.action.reply')}
      </JuiMenuItem>
    );
  }
}

const ReplyView = withTranslation('translations')(ReplyViewComponent);

export { ReplyView };
