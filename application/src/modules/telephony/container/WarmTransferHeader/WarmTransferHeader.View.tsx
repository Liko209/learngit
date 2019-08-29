/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { JuiSwitchCallHeader, JuiSwitchCallChip } from 'jui/pattern/Dialer';
import { HOLD_STATE } from 'sdk/module/telephony/entity';

type Props = ViewProps & WithTranslation;

@observer
class WarmTransferHeaderViewComponent extends React.Component<Props> {
  private _EndCall = () => {
    const { t, endCall } = this.props;
    return (
      <JuiFabButton
        color="semantic.negative"
        size="smallMedium"
        showShadow={false}
        tooltipPlacement="bottom"
        iconName="hand_up"
        onClick={endCall}
        tooltipTitle={t('telephony.action.end')}
        aria-label={t('telephony.action.end')}
        data-test-automation-id="cancel-warm-transfer-btn"
      />
    );
  };

  render() {
    const { switchCallItems, switchCall, currentCallId } = this.props;
    return (
      <JuiSwitchCallHeader>
        {switchCallItems.map((item, inx) => {
          const { holdState, displayName, id, time } = item;
          const active = holdState === HOLD_STATE.IDLE;
          return (
            <JuiSwitchCallChip
              active={currentCallId === id}
              name={displayName}
              time={time}
              icon={active ? 'phone' : 'hold'}
              EndCall={inx === 0 ? this._EndCall : undefined}
              onClick={() => switchCall(id)}
              key={id}
            />
          );
        })}
      </JuiSwitchCallHeader>
    );
  }
}

const WarmTransferHeaderView = withTranslation('translations')(
  WarmTransferHeaderViewComponent,
);

export { WarmTransferHeaderView };
