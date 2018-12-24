/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-07 14:13:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';
import { AttachmentItem, ItemStatus } from './AttachmentItem';

type ItemInfo = {
  id: number;
  name: string;
  status: ItemStatus;
};

type AttachmentListProps = {
  files?: ItemInfo[];
  removeAttachment: (file: ItemInfo) => void;
};

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: ${spacing(2, 0, 0)};
`;

const AttachmentList: React.SFC<AttachmentListProps> = (
  props: AttachmentListProps,
) => {
  const { files = [], removeAttachment } = props;
  return (
    <Wrapper data-test-automation-id="attachment-list">
      {files.map((looper: ItemInfo, idx: number) => (
        <AttachmentItem
          status={looper.status}
          name={looper.name}
          onClickDeleteButton={() => removeAttachment(looper)}
          key={idx}
        />
      ))}
    </Wrapper>
  );
};

export { AttachmentList, ItemInfo };
