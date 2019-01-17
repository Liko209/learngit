/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-17 15:18:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { spacing, grey } from '../../../foundation/utils';

enum EVENT_ICON_TYPE {
  event = 'event',
}

type EventIconProps = JuiIconographyProps & { iconColor?: string };

const WrapperEventIcon = ({ iconColor, ...rest }: EventIconProps) => (
  <JuiIconography {...rest} />
);

const EventIcon = styled<EventIconProps>(WrapperEventIcon)`
  && {
    font-size: ${spacing(5)};
    color: ${({ iconColor }) => (iconColor ? iconColor : grey('500'))};
  }
`;

type Props = {
  iconColor?: string;
};

const JuiEventIcon = (props: Props) => {
  const { iconColor } = props;

  return <EventIcon iconColor={iconColor}>{EVENT_ICON_TYPE.event}</EventIcon>;
};

export { JuiEventIcon };
