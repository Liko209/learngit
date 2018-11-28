/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-24 14:47:35
 * Copyright © RingCentral. All rights reserved.
 */
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
  JuiSnackbarProps,
} from 'jui/components/Snackbars';
import Slide from '@material-ui/core/Slide';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDismiss } from '@/common/genDivAndDismiss';
import ThemeProvider from '@/containers/ThemeProvider';
import Snackbar from '@material-ui/core/Snackbar';

type NotificationPros = JuiSnackbarProps & {
  dismissible?: boolean;
};

type ReturnFunc = {
  dismiss: () => void;
};

type ShowNotificationOptions = JuiSnackbarProps & {
  dismissible?: boolean;
  autoHideDuration?: number;
};

function transitionDown(props: any) {
  return <Slide {...props} direction="down" />;
}

function showNotification(props: ShowNotificationOptions) {
  const { container, dismiss } = genDivAndDismiss();
  const { autoHideDuration, dismissible, ...rest } = props;
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

  const config = { ...rest, action };

  function render(params: JuiSnackbarProps) {
    ReactDOM.render(
      <ThemeProvider>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={true}
          TransitionComponent={transitionDown}
          onClose={dismiss}
          autoHideDuration={autoHideDuration}
        >
          <JuiSnackbarContent {...params} />
        </Snackbar>
      </ThemeProvider>,
      container,
    );
  }
  render(config);
  return {
    dismiss,
  };
}

class Notification extends Component<NotificationPros, {}> {
  static topHat(props: NotificationPros): ReturnFunc {
    const config = {
      messageAlign: 'center',
      fullWidth: true,
      ...props,
    };
    return showNotification(config);
  }

  static flashToast(props: NotificationPros) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      autoHideDuration: 2000,
      ...props,
    };
    return showNotification(config);
  }

  static flagToast(props: NotificationPros) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      ...props,
    };
    return showNotification(config);
  }
}

export { Notification, NotificationPros };
