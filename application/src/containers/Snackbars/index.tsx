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
import Slide from '@material-ui/core/Slide';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDestroy } from '@/common/genDivAndDestroy';
import ThemeProvider from '@/containers/ThemeProvider';
import Snackbar from '@material-ui/core/Snackbar';

type JuiNotificationPros = {
  type: JuiSnackbarsType;
  message: React.ReactNode;
  actions?: [];
  autoHiddenDuration?: number;
};

type ReturnFunc = {
  destroy: () => void;
};

type innerNotificationProps = {
  autoHiddenDuration?: number;
  needCloseButton?: boolean;
} & JuiNotificationPros;

function transitionDown(props: any) {
  return <Slide {...props} direction="down" />;
}

function showNotification(props: innerNotificationProps) {
  const { container, destroy } = genDivAndDestroy();
  const { autoHiddenDuration, needCloseButton, ...rest } = props;
  const config = { ...rest };
  function render(params: JuiSnackbarsProps) {
    ReactDOM.render(
      <ThemeProvider>
        <Snackbar open={true} TransitionComponent={transitionDown}>
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
  static flashToast(props: JuiNotificationPros) {}
  static flagToast(props: JuiNotificationPros) {}
}

export { JuiNotification, JuiNotificationPros };
