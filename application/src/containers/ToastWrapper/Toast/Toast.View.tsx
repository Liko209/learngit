/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 14:42:05
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import {
  JuiSnackbar,
  JuiSnackbarContent,
  JuiSnackbarAction,
} from 'jui/components/Snackbars';
import { observer } from 'mobx-react';
import { ToastViewProps } from './types';
import Slide from '@material-ui/core/Slide';
import { withTranslation, WithTranslation } from 'react-i18next';

type Props = ToastViewProps & WithTranslation;

@observer
class ToastComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this._onClose = this._onClose.bind(this);
  }
  private _onClose(event: object, reason: string) {
    if (reason === 'timeout') {
      this.props.dismiss();
    }
  }
  render() {
    function transitionDown(props: any) {
      return <Slide {...props} direction="down" />;
    }
    const {
      id,
      autoHideDuration,
      dismissible,
      message,
      dismiss,
      t,
      ...rest
    } = this.props;
    const action = [];

    if (dismissible) {
      action.push(
        <JuiSnackbarAction
          key="dismiss"
          variant="icon"
          aria-label="Dismiss"
          onClick={dismiss}
        >
          close
        </JuiSnackbarAction>,
      );
    }
    let ms = message;
    if (typeof message === 'string') {
      ms = t(message);
    }
    const config = { ...rest, action, message: ms };
    return (
      <JuiSnackbar
        noFix={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={true}
        TransitionComponent={transitionDown}
        onClose={this._onClose}
        autoHideDuration={autoHideDuration}
      >
        <JuiSnackbarContent {...config} />
      </JuiSnackbar>
    );
  }
}

const ToastView = withTranslation('translations')(ToastComponent);

export { ToastView };
