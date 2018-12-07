/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-07 14:13:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiListItem from '@material-ui/core/ListItem';
import * as Jui from '../ConversationCard/Files/style';
import { FileName } from '../ConversationCard/Files/FileName';
import styled from '../../foundation/styled-components';
import { shape, spacing } from '../../foundation/utils/styles';
import { JuiIconButton } from '../../components/Buttons';

type AttachmentListProps = {
  files?: File[];
  cancelUploadFile: (file: File) => void;
};

const Wrapper = styled.div``;

const FileExpandItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2)};
    margin: ${spacing(2, 0, 0, 0)};
    width: 50%;
    border-radius: ${shape('borderRadius', 1)};
    box-shadow: ${props => props.theme.shadows[1]};
  }
`;

const NameWithActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
`;

const FileNameWrapper = styled.div`
  width: ${spacing(58)};
`;

const ActionWrapper = styled.div`
  display: flex;
`;

const FileItem = (props: {
  file: File;
  cancelUploadFile: (file: File) => void;
}) => (
  <FileExpandItem>
    <Jui.FileIcon size="small" />
    <NameWithActions>
      <FileNameWrapper>
        <FileName filename={props.file.name} />
      </FileNameWrapper>
      <ActionWrapper>
        {
          <JuiIconButton
            onClick={() => props.cancelUploadFile(props.file)}
            variant="plain"
            disableToolTip={true}
          >
            close
          </JuiIconButton>
        }
      </ActionWrapper>
    </NameWithActions>
  </FileExpandItem>
);

const AttachmentList: React.SFC<AttachmentListProps> = (
  props: AttachmentListProps,
) => {
  const { files = [], cancelUploadFile } = props;
  return (
    <Wrapper>
      {files.map((file: File, idx: number) => (
        <FileItem file={file} cancelUploadFile={cancelUploadFile} key={idx} />
      ))}
    </Wrapper>
  );
};

export { AttachmentList };
