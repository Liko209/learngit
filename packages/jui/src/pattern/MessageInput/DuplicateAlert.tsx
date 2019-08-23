/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-08 00:15:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { JuiButton } from '../../components/Buttons/Button';
import { JuiModal } from '../../components/Dialog';
import styled from '../../foundation/styled-components';
import {
  height,
  grey,
  spacing,
  typography,
  ellipsis,
} from '../../foundation/utils/styles';
import { FileName } from '../ConversationCard/Files/FileName';

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
`;

const Content = styled.div`
  color: ${grey('700')};
  ${typography('body1')}
`;

type Props = {
  title: string;
  subtitle: string;
  footText: string;
  cancelText: string;
  updateText: string;
  createText: string;
  onCancel: () => void;
  onUpdate: () => void;
  onCreate: () => void;
  duplicateFileNames: (React.ReactChild | null | (React.ReactChild | null)[])[];
  onEscTrackedCancel?: () => void;
};

const NameList = styled.ul`
  max-height: ${height(44.5)};
  overflow-y: auto;
  background: ${grey('50')};
  padding: ${spacing(2)};
  box-sizing: border-box;
  ${typography('body2')}
`;

const Item = styled.li`
  list-style: none;
  line-height: ${height(5)};
  &:not(:last-child) {
    margin: 0 0 ${spacing(2)} 0;
  }
  ${ellipsis()};
`;

const JuiDuplicateAlert: React.SFC<Props> = memo((props: Props) => {
  const {
    onCancel,
    onUpdate,
    onCreate,
    duplicateFileNames,
    title,
    subtitle,
    footText,
    cancelText,
    updateText,
    createText,
    onEscTrackedCancel,
  } = props;
  const showDuplicateFiles = duplicateFileNames.length > 0;
  /* eslint-disable react/no-array-index-key */
  if (showDuplicateFiles) {
    const content = (
      <Content data-test-automation-id="messageinput-duplicate-modal-title">
        {subtitle}
        <NameList>
          {duplicateFileNames.map((fileName: string, index: number) => (
            <Item key={index}>
              <FileName>{fileName}</FileName>
            </Item>
          ))}
        </NameList>
        {footText}
      </Content>
    );
    const footer = (
      <Footer data-test-automation-id="messageinput-duplicate-footer">
        <JuiButton
          onClick={onCancel}
          color="primary"
          variant="text"
          autoFocus
          data-test-automation-id="messageinput-duplicate-cancel-button"
        >
          {cancelText}
        </JuiButton>
        <JuiButton
          onClick={onUpdate}
          color="primary"
          variant="contained"
          autoFocus
          data-test-automation-id="messageinput-duplicate-update-button"
        >
          {updateText}
        </JuiButton>
        <JuiButton
          onClick={onCreate}
          color="primary"
          variant="contained"
          autoFocus
          data-test-automation-id="messageinput-duplicate-create-button"
        >
          {createText}
        </JuiButton>
      </Footer>
    );
    return (
      <JuiModal
        onClose={onEscTrackedCancel}
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
});

export { JuiDuplicateAlert };
