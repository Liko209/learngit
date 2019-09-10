/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-21 13:58:11
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components/Menus';
import { ViewProps } from './types';

type Props = ViewProps & WithTranslation;

@observer
class TransferViewComponent extends React.Component<Props> {
  handleClick = () => {
    const { directToTransferPage } = this.props;
    directToTransferPage();
  };
  render() {
    const { t, disabledTransferAction } = this.props;
    return (
      <JuiMenuItem
        onClick={this.handleClick}
        data-test-automation-id="telephony-transfer-menu-item"
        disabled={disabledTransferAction}
      >
        {t('telephony.action.transfer')}
      </JuiMenuItem>
    );
  }
}

const TransferView = withTranslation('translations')(TransferViewComponent);

export { TransferView };
