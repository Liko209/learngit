/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 10:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import * as ReactDOM from 'react-dom';
import JuiDialog, { IDialogProps } from '../../atoms/Dialog';
import JuiDialogTitle from '../../atoms/DialogTitle';
import JuiDialogContent from '../../atoms/DialogContent';
import JuiDialogContentText from '../../atoms/DialogContentText';
import JuiDialogActions from '../../atoms/DialogActions';
import JuiButton from '../../atoms/Button';
import styled from '../../styled-components';
import { DialogActionsProps } from '@material-ui/core/DialogActions';
import { spacing } from '../../utils';
import { Overwrite } from '@material-ui/core';
import { Theme as MuiTheme } from '@material-ui/core/styles/createMuiTheme';

type IDefaultProps = {
  size: IDialogProps['size'];
  open: boolean;
  okText: string;
  cancelText: string;
};

type IJuiModal = IDialogProps &
  Partial<IDefaultProps> & {
    onOK(event?: React.MouseEvent): void;
    onCancel?: (event?: React.MouseEvent) => void;
    header: JSX.Element | string;
    children: JSX.Element | string;
    okCancel?: boolean;
    cancelText?: string;
    theme?: MuiTheme;
    afterClosed?: Function;
  };

type TOnDestroyArgs = {
  triggerCancel?: boolean;
};

type DynamicModalProps = Overwrite<
  IJuiModal,
  {
    open?: boolean;
  }
>;

type TModalFunc = (
  props: DynamicModalProps,
  context: React.Component,
) => TDynamicModal;

type TDynamicModal = {
  destroy: (args?: TOnDestroyArgs) => void;
};

const StyledActions = styled<DialogActionsProps>(JuiDialogActions)`
  & button {
    margin-left: ${spacing(2)};
  }
`;
class JuiModal extends React.PureComponent<IJuiModal> {
  static alert: TModalFunc = function (props: DynamicModalProps, context) {
    const config = {
      okCancel: false,
      ...props,
    };
    return modal(config, context);
  };
  static defaultProps: IDefaultProps = {
    open: false,
    size: 'small',
    okText: 'Ok',
    cancelText: 'Cancel',
  };
  componentDidUpdate(preProps: IJuiModal) {
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
const modal: TModalFunc = function (
  config: DynamicModalProps,
  context: React.Component,
) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const destroy = ({ triggerCancel, ...onCancelArgs }: TOnDestroyArgs = {}) => {
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

  const close = (args?: TOnDestroyArgs) => {
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

export default JuiModal;
export { JuiModal, IJuiModal, TDynamicModal };
