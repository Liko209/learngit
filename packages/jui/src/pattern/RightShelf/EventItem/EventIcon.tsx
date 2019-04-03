/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-17 15:18:08
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';

import {
  JuiIconography,
  JuiIconographyProps,
} from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { spacing, getAccentColor, grey } from '../../../foundation/utils';
import { Palette } from '../../../foundation/theme/theme';

enum EVENT_ICON_TYPE {
  event = 'event',
}

type EventIconProps = JuiIconographyProps & {
  iconColor?: [keyof Palette, string];
};

type Props = {
  iconColor?: [keyof Palette, string];
};

const WrapperEventIcon = memo(({ iconColor, ...rest }: EventIconProps) => (
  <JuiIconography {...rest} />
));

const EventIcon = styled<EventIconProps>(WrapperEventIcon)`
  && {
    font-size: ${spacing(5)};
    color: ${({ iconColor }) => getAccentColor(iconColor, grey('500'))};
  }
`;

const JuiEventIcon = memo((props: Props) => {
  const { iconColor } = props;

  return <EventIcon iconColor={iconColor}>{EVENT_ICON_TYPE.event}</EventIcon>;
});

export { JuiEventIcon };
