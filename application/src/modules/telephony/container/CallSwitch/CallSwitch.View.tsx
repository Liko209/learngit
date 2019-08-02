/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-26 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiCallSwitch } from 'jui/pattern/Dialer';
import { ViewProps } from './types';

type Props = WithTranslation & ViewProps;

@observer
class CallSwitchViewComponent extends React.Component<Props> {
  render() {
    const { t, displayName } = this.props;
    return (
      <JuiCallSwitch
        message={t('telephony.switchCall.content', {
          displayName,
        })}
      />
    );
  }
}

export const CallSwitchView = withTranslation('translations')(
  CallSwitchViewComponent,
);
