/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-07 14:13:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { AttachmentItem, ItemStatus } from './AttachmentItem';
import { height, spacing } from '../../foundation/utils/styles';

type ItemInfo = {
  file: File;
  status: ItemStatus;
};

type AttachmentListProps = {
  files?: ItemInfo[];
  removeAttachment: (file: ItemInfo) => void;
};

const Wrapper = styled.div`
  display: flex;
  max-height: ${height(45)};
  overflow-y: scroll;
  flex-wrap: wrap;
  padding-left: ${spacing(1)};
  padding-top: ${spacing(1)};
`;

const AttachmentList: React.SFC<AttachmentListProps> = (
  props: AttachmentListProps,
) => {
  const { files = [], removeAttachment } = props;
  return (
    <Wrapper>
      {files.map((looper: ItemInfo, idx: number) => (
        <AttachmentItem
          status={looper.status}
          name={looper.file.name}
          onClickDeleteButton={() => removeAttachment(looper)}
          key={idx}
        />
      ))}
    </Wrapper>
  );
};

export { AttachmentList, ItemInfo };
