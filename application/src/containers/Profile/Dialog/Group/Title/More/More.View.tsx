/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
// import { JuiHorizMenu } from 'jui/pattern/GroupTeamProfile';
import { JuiIconButton } from 'jui/components/Buttons';
// import copy from 'copy-to-clipboard';
// import { accessHandler } from '../../AccessHandler';
import { MoreViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import copy from 'copy-to-clipboard';

@observer
class More extends React.Component<WithNamespaces & MoreViewProps> {
  renderAnchor = () => {
    const { t, size } = this.props;
    return (
      <JuiIconButton
        size={size}
        data-name="actionBarMore"
        tooltipTitle={t('more')}
        ariaLabel={t('checkMoreTeamOption')}
      >
        more_horiz
      </JuiIconButton>
    );
  }

  onClickCopyUrl = () => {
    const { url } = this.props;
    copy(url);
  }

  onClickCopyEmail = async () => {
    const { email } = this.props;
    copy(email);
  }

  render() {
    const { t } = this.props;
    return (
      <JuiPopoverMenu
        Anchor={this.renderAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <JuiMenuList>
          <JuiMenuItem onClick={this.onClickCopyUrl}>
            {t('copyUrl')}
          </JuiMenuItem>
          <JuiMenuItem onClick={this.onClickCopyEmail}>
            {t('copyEmail')}
          </JuiMenuItem>
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}
const MoreView = translate('translations')(More);
export { MoreView };
