/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { JuiHorizMenu } from 'jui/pattern/GroupTeamProfile';
import { JuiIconButton, JuiIconButtonProps } from 'jui/components/Buttons';
import { translate, WithNamespaces } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { CONVERSATION_TYPES } from '@/constants';
import { accessHandler } from '../../AccessHandler';

type Props = WithNamespaces & {
  groupUrl: string;
  email: string;
  type: CONVERSATION_TYPES;
};
@observer
class MoreHoriz extends React.Component<Props> {
  private _onMenuClick = (moreMenuTriggerProps: JuiIconButtonProps) => {
    const { t, type } = this.props;
    const checkMoreOption = accessHandler(type).checkMoreOption;
    return (
      <JuiIconButton
        {...moreMenuTriggerProps}
        disableToolTip={false}
        tooltipTitle={t('more')}
        size="medium"
        ariaLabel={t(checkMoreOption)}
      >
        more_horiz
      </JuiIconButton>
    );
  }
  private _onEmailCopied = () => {
    const { email } = this.props;
    copy(email);
  }
  private _onUrlCopied = () => {
    const { groupUrl } = this.props;
    copy(groupUrl);
  }
  render() {
    const { t, type } = this.props;
    const { copyUrl } = accessHandler(type);
    return (
      <JuiHorizMenu
        className="horiz-menu"
        menuItems={[
          {
            label: t('copyProfileEmail'),
            onClick: this._onEmailCopied,
            ariaLabel: t(copyUrl),
          },
          {
            label: t('copyProfileUrl'),
            onClick: this._onUrlCopied,
            ariaLabel: t('copyUrl'),
          },
        ]}
        MenuExpandTrigger={this._onMenuClick}
      />
    );
  }
}
const MoreHorizView = translate('translations')(MoreHoriz);
export { MoreHorizView };
