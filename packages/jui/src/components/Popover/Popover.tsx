/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 13:29:01
 * Copyright © RingCentral. All rights reserved.
 */
import MuiPopover, {
  PopoverProps as MuiPopoverProps,
} from '@material-ui/core/Popover';
import styled from '../../foundation/styled-components';

type JuiPopoverProps = MuiPopoverProps;

const JuiPopover = styled(MuiPopover)``;

JuiPopover.displayName = 'JuiPopover';

export { JuiPopover, JuiPopoverProps };
