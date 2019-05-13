/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiHeader } from 'jui/pattern/Dialer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DialerHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';

@observer
class DialerHeaderViewComponent extends React.Component<
  DialerHeaderViewProps & WithTranslation
> {
  private _Avatar = () => {
    const { uid } = this.props;
    if (uid) {
      return <Avatar uid={uid} size="large" />;
    }
    return null;
  }

  render() {
    const { name, phone, isExt, Back, t } = this.props;
    return (
      <JuiHeader
        Avatar={this._Avatar}
        name={name}
        phone={isExt ? `${t('telephony.Ext')} ${phone}` : phone}
        Back={Back}
      />
    );
  }
}

const DialerHeaderView = withTranslation('translations')(
  DialerHeaderViewComponent,
);

export { DialerHeaderView };
