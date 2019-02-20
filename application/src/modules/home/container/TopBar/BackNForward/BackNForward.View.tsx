/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 15:31:08
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiHistoryOperation, OPERATION } from 'jui/pattern/HistoryOperation';

type Props = WithNamespaces & {
  backRecord: { title: string; pathname: string }[];
  forwardRecord: { title: string; pathname: string }[];
  showBackPanel: boolean;
  showForwardPanel: boolean;
  disabledBack: boolean;
  disabledForward: boolean;
  forward: (event: React.MouseEvent<HTMLSpanElement>) => void;
  back: (event: React.MouseEvent<HTMLSpanElement>) => void;
  go: (type: OPERATION, index: number) => void;
  toggleBackPanel: (
    event:
      | React.TouchEvent<Element>
      | React.MouseEvent<HTMLElement>
      | React.ChangeEvent<{}>,
  ) => void;
  toggleForwardPanel: (
    event:
      | React.TouchEvent<Element>
      | React.MouseEvent<HTMLElement>
      | React.ChangeEvent<{}>,
  ) => void;
};

@observer
class BackNForward extends Component<Props> {
  render() {
    const {
      backRecord,
      forwardRecord,
      disabledBack,
      disabledForward,
      forward,
      back,
      go,
      t,
    } = this.props;

    return (
      <>
        <JuiHistoryOperation
          type={OPERATION.BACK}
          menu={backRecord.reverse()}
          disabled={disabledBack}
          tooltipTitle={t('common.back')}
          onClick={back}
          onClickMenu={go}
        />
        <JuiHistoryOperation
          type={OPERATION.FORWARD}
          menu={forwardRecord}
          tooltipTitle={t('common.forward')}
          disabled={disabledForward}
          onClick={forward}
          onClickMenu={go}
        />
      </>
    );
  }
}

const BackNForwardView = translate('translations')(BackNForward);

export { BackNForwardView };
