/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 14:04:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiModal, JuiModalProps } from './Modal1';
import { Omit } from '../../foundation/utils/typeHelper';

type JuiConfirmProps = Omit<JuiModalProps, 'cancelText'> & {
  cancelText: string;
  content: string | JSX.Element;
};

class JuiConfirm extends React.Component<JuiConfirmProps, {}> {
  render() {
    const {
      title,
      open,
      size,
      okText,
      onOK,
      onCancel,
      cancelText,
      content,
    } = this.props;
    return (
      <JuiModal
        open={open}
        title={title}
        okText={okText}
        size={size}
        onOK={onOK}
        onCancel={onCancel}
        cancelText={cancelText}
      >
        {content}
      </JuiModal>
    );
  }
}

export { JuiConfirm, JuiConfirmProps };
