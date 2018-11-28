/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-24 14:47:35
 * Copyright © RingCentral. All rights reserved.
 */
import {
  JuiSnackbarContent,
  JuiSnackbarsProps,
  // MessageAlignment,
  // SnackbarContentColor,
  JuiSnackbarsType,
} from 'jui/components/Snackbars';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import Slide from '@material-ui/core/Slide';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDestroy } from '@/common/genDivAndDestroy';
import ThemeProvider from '@/containers/ThemeProvider';
import Snackbar from '@material-ui/core/Snackbar';

type JuiNotificationPros = {
  type: JuiSnackbarsType;
  message: React.ReactNode;
  actions?: React.ReactNode[];
  needCloseButton?: boolean;
};

type ReturnFunc = {
  destroy: () => void;
};

type innerNotificationProps = {
  autoHideDuration?: number;
  needCloseButton?: boolean;
} & JuiNotificationPros;

function transitionDown(props: any) {
  return <Slide {...props} direction="down" />;
}

function getCloseButton(onClose: () => void) {
  return (
    <JuiIconButton
      key="close"
      aria-label="Close"
      color="inherit"
      size="medium"
      onClick={onClose}
    >
      close
    </JuiIconButton>
  );
}

function showNotification(props: innerNotificationProps) {
  const { container, destroy } = genDivAndDestroy();
  const { autoHideDuration, needCloseButton, ...rest } = props;
  const action = [];
  const closeFunction = () => {
    destroy();
  };
  if (needCloseButton) {
    action.push(getCloseButton(closeFunction));
  }

  const config = { ...rest, action };
  const state = true;

  function render(params: JuiSnackbarsProps) {
    ReactDOM.render(
      <ThemeProvider>
        <Snackbar
          open={state}
          TransitionComponent={transitionDown}
          onClose={closeFunction}
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
    destroy,
  };
}

class JuiNotification extends Component<JuiNotificationPros, {}> {
  static topHat(props: JuiNotificationPros): ReturnFunc {
    const config = {
      messageAlign: 'center',
      fullWidth: true,
      radius: 0,
      ...props,
    };
    return showNotification(config);
  }
  static flashToast(props: JuiNotificationPros) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      radius: 4,
      autoHideDuration: 2000,
      ...props,
    };
    return showNotification(config);
  }
  static flagToast(props: JuiNotificationPros) {
    const config = {
      messageAlign: 'left',
      fullWidth: false,
      radius: 4,
      ...props,
    };
    return showNotification(config);
  }
}
Object.assign(window, {
  JuiNotification,
});
export { JuiNotification, JuiNotificationPros };
