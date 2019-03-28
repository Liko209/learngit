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
import {
  width,
  height,
  grey,
  spacing,
  getAccentColor,
} from '../../../foundation/utils';
import { Palette } from '../../../foundation/theme/theme';

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

type TaskIconProps = JuiIconographyProps & {
  iconColor?: [keyof Palette, string];
};

type Props = {
  complete: boolean;
  iconColor?: [keyof Palette, string];
};

const WrapperTaskIcon = ({ iconColor, ...rest }: TaskIconProps) => (
  <JuiIconography iconSize="medium" {...rest} />
);

const TaskIcon = styled<TaskIconProps>(WrapperTaskIcon)`
  && {
    color: ${({ iconColor }) => getAccentColor(iconColor, grey('500'))};
  }
`;

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
