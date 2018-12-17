/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-08 00:15:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiButton } from '../../components/Buttons/Button';
import { JuiModal } from '../../components/Dialog';
import styled from '../../foundation/styled-components';

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const Right = styled.div``;

const Content = styled.div``;

type Props = {
  title: string;
  subtitle: string;
  footText: string;
  onCancel: () => void;
  onUpdate: () => void;
  onCreate: () => void;
  duplicateFiles: File[];
};

const DuplicateAlert: React.SFC<Props> = (props: Props) => {
  const {
    onCancel,
    onUpdate,
    onCreate,
    duplicateFiles,
    title,
    subtitle,
    footText,
  } = props;
  const showDuplicateFiles = duplicateFiles.length > 0;
  if (showDuplicateFiles) {
    const content = (
      <Content data-test-automation-id="messageinput-duplicate-modal-title">
        {subtitle}
        <br />
        <ul>
          {duplicateFiles.map((file: File, index: number) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
        <br />
        {footText}
      </Content>
    );
    const footer = (
      <Footer data-test-automation-id="messageinput-duplicate-footer">
        <JuiButton
          onClick={onCreate}
          color="primary"
          variant="contained"
          autoFocus={true}
          data-test-automation-id="messageinput-duplicate-create-button"
        >
          {'Create'}
        </JuiButton>
        <Right>
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant="text"
            autoFocus={true}
            data-test-automation-id="messageinput-duplicate-cancel-button"
          >
            {'Cancel'}
          </JuiButton>
          <JuiButton
            onClick={onUpdate}
            color="primary"
            variant="contained"
            autoFocus={true}
            data-test-automation-id="messageinput-duplicate-update-button"
          >
            {'Update'}
          </JuiButton>
        </Right>
      </Footer>
    );
    return (
      <JuiModal
        open={showDuplicateFiles}
        title={title}
        footer={footer}
        data-test-automation-id="messageinput-duplicate-modal"
      >
        {content}
      </JuiModal>
    );
  }
  return null;
};

export { DuplicateAlert };
