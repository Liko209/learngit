/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 10:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import * as ReactDOM from 'react-dom';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiDialogTitle } from './DialogTitle';
import { JuiDialogContent } from './DialogContent';
import { JuiDialogContentText } from './DialogContentText';
import { JuiDialogActions } from './DialogActions';
import { JuiButton } from '../Buttons/Button';
import styled from '../../foundation/styled-components';
import { DialogActionsProps } from '@material-ui/core/DialogActions';
import { spacing } from '../../foundation/utils';
import { Overwrite } from '@material-ui/core';
import { Theme as MuiTheme } from '@material-ui/core/styles/createMuiTheme';

type DefaultProps = {
  size: JuiDialogProps['size'];
  open: boolean;
  okText: string;
  cancelText: string;
};

type JuiModalProps = JuiDialogProps &
  Partial<DefaultProps> & {
    onOK(event?: React.MouseEvent): void;
    onCancel?: (event?: React.MouseEvent) => void;
    header: JSX.Element | string;
    children: JSX.Element | string;
    okCancel?: boolean;
    cancelText?: string;
    theme?: MuiTheme;
    afterClosed?: Function;
  };

type OnDestroyArgs = {
  triggerCancel?: boolean;
};

type DynamicModalProps = Overwrite<
  JuiModalProps,
  {
    open?: boolean;
  }
>;

type ModalFunc = (
  props: DynamicModalProps,
  context: React.Component,
) => DynamicModal;

type DynamicModal = {
  destroy: (args?: OnDestroyArgs) => void;
};

const StyledActions = styled<DialogActionsProps>(JuiDialogActions)`
  & button {
    margin-left: ${spacing(2)};
  }
`;
class JuiModal extends React.PureComponent<JuiModalProps> {
  static alert: ModalFunc = function (props: DynamicModalProps, context) {
    const config = {
      okCancel: false,
      ...props,
    };
    return modal(config, context);
  };
  static defaultProps: DefaultProps = {
    open: false,
    size: 'small',
    okText: 'Ok',
    cancelText: 'Cancel',
  };
  componentDidUpdate(preProps: JuiModalProps) {
    const { afterClosed, open } = this.props;
    if (preProps.open && !open && afterClosed) {
      setTimeout(afterClosed, 2000);
    }
  }
  render() {
    const {
      open,
      size,
      header,
      children,
      okCancel,
      onCancel,
      cancelText,
      onOK,
      okText,
    } = this.props;
    return (
      <JuiDialog open={open!} size={size}>
        <JuiDialogTitle>{header}</JuiDialogTitle>
        <JuiDialogContent>
          <JuiDialogContentText>{children}</JuiDialogContentText>
        </JuiDialogContent>
        <StyledActions>
          {okCancel && (
            <JuiButton onClick={onCancel} color="primary" variant="text">
              {cancelText}
            </JuiButton>
          )}
          <JuiButton
            onClick={onOK}
            color="primary"
            variant="contained"
            autoFocus={true}
          >
            {okText}
          </JuiButton>
        </StyledActions>
      </JuiDialog>
    );
  }
}
const modal: ModalFunc = function (
  config: DynamicModalProps,
  context: React.Component,
) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const destroy = ({ triggerCancel, ...onCancelArgs }: OnDestroyArgs = {}) => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    if (config.onCancel && triggerCancel) {
      config.onCancel();
    }
  };

  const update = (newConfig: DynamicModalProps) => {
    currentConfig = {
      ...currentConfig,
      ...newConfig,
    };
    render(currentConfig);
  };

  const render = ({
    onOK: _onOK,
    onCancel: _onCancel,
    ...props
  }: DynamicModalProps) => {
    const onOK = () => {
      close();
      _onOK();
    };
    const onCancel = () => {
      close();
      _onCancel && _onCancel();
    };
    ReactDOM.unstable_renderSubtreeIntoContainer(
      context,
      <JuiModal {...{ ...props, onOK, onCancel }} />,
      div,
    );
  };

  const close = (args?: OnDestroyArgs) => {
    currentConfig = {
      ...currentConfig,
      afterClosed: destroy,
      open: false,
    };
    render(currentConfig);
  };

  let currentConfig = { close, open: true, ...config };
  render(currentConfig);
  return {
    update,
    destroy: close,
  };
};

export { JuiModal, JuiModalProps, DynamicModal };
