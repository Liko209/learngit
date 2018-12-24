/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-08 00:15:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
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
  onCancel: () => void;
  onUpdate: () => void;
  onCreate: () => void;
  duplicateFiles: File[];
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
  ${ellipsis};
`;

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
        <NameList>
          {duplicateFiles.map((file: File, index: number) => (
            <Item key={index}>{file.name}</Item>
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
        <JuiButton
          onClick={onCreate}
          color="primary"
          variant="contained"
          autoFocus={true}
          data-test-automation-id="messageinput-duplicate-create-button"
        >
          {'Create'}
        </JuiButton>
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
