/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-10 14:00:36
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiModal, JuiModalProps } from './Modal1';

type JuiAlertProps = JuiModalProps & {
  onOK(event?: React.MouseEvent): void;
  content: string | JSX.Element;
};

class JuiAlert extends React.Component<JuiAlertProps, {}> {
  render() {
    const { title, open, size, okText, onOK, content } = this.props;
    return (
      <JuiModal
        open={open}
        title={title}
        onOK={onOK}
        okText={okText}
        size={size}
      >
        {content}
      </JuiModal>
    );
  }
}

export { JuiAlert, JuiAlertProps };
