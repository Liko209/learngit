/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

/* eslint-disable */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { OpenProfileDialogProps, OpenProfileDialogViewProps } from './types';
import portalManager from '@/common/PortalManager';
import { withRCMode } from '@/containers/withRCMode';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogFuncProps } from 'jui/components/Dialog';
import { analyticsCollector } from '@/AnalyticsCollector';

type Props = OpenProfileDialogProps & OpenProfileDialogViewProps;

@observer
@withRCMode()
class OpenProfileDialogView extends Component<Props> {
  private _dismiss: Function;
  constructor(props: Props) {
    super(props);
  }

  private _show = (
    id: number,
    ProfileDialog: React.ComponentType<any>,
    beforeClick?: (() => void) | null,
    afterClick?: (() => void) | null,
    options?: JuiDialogFuncProps,
  ) => {
    beforeClick && beforeClick();
    if (this._dismiss) {
      this._dismiss();
    }
    const { dismiss } = Dialog.simple(<ProfileDialog id={id} />, {
      size: 'medium',
      scroll: 'body',
      ...options,
    });

    afterClick && afterClick();
    this._dismiss = dismiss;
  };

  private _onClickOpenProfileDialog = (event: MouseEvent<HTMLElement>) => {
    const {
      beforeClick,
      id,
      afterClick,
      profileDialog,
      dataTrackingProps: { category, source },
    } = this.props;

    analyticsCollector.profileDialog(category, source);

    // needed for avoid Blinking when switching dialog
    const transitionDuration = portalManager.profilePortalIsShow
      ? {
          transitionDuration: 900,
        }
      : undefined;

    this._show(
      id,
      profileDialog,
      () => {
        beforeClick && beforeClick(event);
      },
      () => {
        afterClick && afterClick(event);
      },
      transitionDuration,
    );
  };

  render() {
    const { children } = this.props;
    return <span onClick={this._onClickOpenProfileDialog}>{children}</span>;
  }
}

export { OpenProfileDialogView };
