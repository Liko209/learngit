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

const Content = styled.p``;

type Props = {
  onCancel: () => void;
  onUpdate: () => void;
  onCreate: () => void;
  duplicateFiles: File[];
};

const DuplicateAlert: React.SFC<Props> = (props: Props) => {
  const { onCancel, onUpdate, onCreate, duplicateFiles } = props;
  const showDuplicateFiles = duplicateFiles.length > 0;
  if (showDuplicateFiles) {
    const title = 'Updated Files?';
    const content = (
      <Content>
        The following files already exist.
        {duplicateFiles.map((file: File, index: number) => (
          <div key={index}>{file.name}</div>
        ))}
        Do you want to update the existing files or do you wish to create new
        files?
      </Content>
    );
    const footer = (
      <Footer>
        <JuiButton
          onClick={onCreate}
          color="primary"
          variant="contained"
          autoFocus={true}
        >
          {'Create'}
        </JuiButton>
        <Right>
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant="text"
            autoFocus={true}
          >
            {'Cancel'}
          </JuiButton>
          <JuiButton
            onClick={onUpdate}
            color="primary"
            variant="contained"
            autoFocus={true}
          >
            {'Update'}
          </JuiButton>
        </Right>
      </Footer>
    );
    return (
      <JuiModal open={showDuplicateFiles} title={title} footer={footer}>
        {content}
      </JuiModal>
    );
  }
  return null;
};

export { DuplicateAlert };
