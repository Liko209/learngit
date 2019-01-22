/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 10:33:47
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';

import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { width, height, grey, spacing } from '../../../foundation/utils';

enum TASK_TYPE {
  task_incomplete = 'task_incomplete',
  tasks = 'tasks',
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

type TaskIconProps = JuiIconographyProps & { iconColor?: string };

const WrapperTaskIcon = ({ iconColor, ...rest }: TaskIconProps) => (
  <JuiIconography {...rest} />
);

const TaskIcon = styled<TaskIconProps>(WrapperTaskIcon)`
  && {
    font-size: ${spacing(5)};
    color: ${({ iconColor }) => (iconColor ? iconColor : grey('500'))};
  }
`;

type Props = {
  complete: boolean;
  iconColor?: string;
};

const JuiTaskIcon = React.memo((props: Props) => {
  const { complete, iconColor } = props;

  return (
    <TaskIconWrapper>
      <TaskIcon iconColor={iconColor}>
        {complete ? TASK_TYPE.tasks : TASK_TYPE.task_incomplete}
      </TaskIcon>
    </TaskIconWrapper>
  );
});

export { JuiTaskIcon };
