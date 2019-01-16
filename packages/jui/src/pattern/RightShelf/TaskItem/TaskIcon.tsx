/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 10:33:47
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';

import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { width, height, grey, spacing } from '../../../foundation/utils';

enum TASK_TYPE {
  task_incomplete = 'task_incomplete',
  task = 'task',
}

const TaskIconWrapper = styled.div`
  && {
    width: ${width(9)};
    height: ${height(9)};
    background: ${grey('100')};
    border-radius: ${spacing(1)};
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
`;

const TaskIcon = styled(JuiIconography)`
  && {
    font-size: ${spacing(5)};
    color: ${grey('500')};
  }
`;

type Props = {
  complete: boolean;
};

const JuiTaskIcon = React.memo((props: Props) => {
  const { complete } = props;

  return (
    <TaskIconWrapper>
      <TaskIcon>
        {complete ? TASK_TYPE.task : TASK_TYPE.task_incomplete}
      </TaskIcon>
    </TaskIconWrapper>
  );
});

export { JuiTaskIcon };
