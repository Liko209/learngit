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

type Props = WithNamespaces & {
  groupUrl: string;
};
@observer
class MoreHoriz extends React.Component<Props> {
  private _onMenuClick = (moreMenuTriggerProps: JuiIconButtonProps) => {
    return (
      <JuiIconButton {...moreMenuTriggerProps} isShowToolTip={false} tooltipTitle="more" size="medium">
        more_horiz
      </JuiIconButton>
    );
  }
  private _onEmailCopied = () => {};
  private _onUrlCopied = () => {
    const { groupUrl } = this.props;
    copy(groupUrl);
  }
  render() {
    return (
      <JuiHorizMenu
        className="horiz-menu"
        menuItems={[{
          label: 'copy email',
          onClick: this._onEmailCopied,
        }, {
          label: 'copy url',
          onClick: this._onUrlCopied,
        }]}
        MenuExpandTrigger={this._onMenuClick}
      />
    );
  }
}
const MoreHorizView = translate('translations')(MoreHoriz);
export { MoreHorizView };
