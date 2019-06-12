/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-29 17:10:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { JuiMenuItem } from 'jui/components/Menus';

type Props = ViewProps & WithTranslation;

@observer
class ParkViewComponent extends React.Component<Props> {
  handleClick = () => {
    const { park } = this.props;
    park();
  }

  render() {
    const { t, disabled } = this.props;
    return (
      <JuiMenuItem
        onClick={this.handleClick}
        disabled={disabled}
        data-test-automation-id="telephony-park-menu-item"
      >
        {t('telephony.action.park')}
      </JuiMenuItem>
    );
  }
}

const ParkView = withTranslation('translations')(ParkViewComponent);
export { ParkView };
