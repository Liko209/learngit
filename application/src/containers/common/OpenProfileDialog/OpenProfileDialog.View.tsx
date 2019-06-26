/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { OpenProfileDialogProps, OpenProfileDialogViewProps } from './types';
import portalManager from '@/common/PortalManager';
import { OpenProfile } from '@/common/OpenProfile';

type Props = OpenProfileDialogProps & OpenProfileDialogViewProps;

@observer
class OpenProfileDialogView extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private _onClickOpenProfileDialog = (event: MouseEvent<HTMLElement>) => {
    const { id, beforeClick, afterClick } = this.props;
    // needed for avoid Blinking when switching dialog
    const transitionDuration = portalManager.hasShowStatus
      ? {
          transitionDuration: 900,
        }
      : undefined;

    OpenProfile.show(
      id,
      () => {
        beforeClick && beforeClick(event);
      },
      () => {
        afterClick && afterClick(event);
      },
      transitionDuration,
    );
  }

  render() {
    const { children } = this.props;
    return <span onClick={this._onClickOpenProfileDialog}>{children}</span>;
  }
}

export { OpenProfileDialogView };
