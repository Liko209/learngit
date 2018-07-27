/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-06 09:46:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';

interface Props {
  showModal: boolean;
  children?: ReactNode;
  handleCloseModal: any;
  className?: string;
  modalClassName?: string;
}

ReactModal.setAppElement('#root');

const ReactModalAdapter: React.SFC<Props> = ({
  className,
  modalClassName,
  ...props
}: Props) => {
  return (
    <ReactModal
        className={modalClassName}
        portalClassName={className}
        isOpen={props.showModal}
        contentLabel="onRequestClose Example"
        onRequestClose={props.handleCloseModal}
        {...props}
    >
      {props.children}
    </ReactModal>
  );
};

const StyledModal = styled(ReactModalAdapter).attrs({
  modalClassName: 'Modal',
  overlayClassName: 'Overlay'
} as any)`
  .Modal {
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 20px;
    width: 640px;
    transform: translate(-50%, -50%);
    background-color: #f9f9f9;
    box-shadow: rgba(0, 0, 0, 0.3) 0 10px 30px;
    border-radius: 4px;
    outline: none;
  }
  .Overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 12;
  }
`;

export default StyledModal;
