/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
type ProfileButtonProps = {
  id: number;
};
type ProfileButtonViewProps = {
  handleGlobalGroupId: (event: MouseEvent<HTMLElement>) => void;
  id: number;
  typeId: number;
};
export { ProfileButtonProps, ProfileButtonViewProps };
