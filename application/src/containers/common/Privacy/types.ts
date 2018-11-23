/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

// import GroupModel from '@/store/models/Group';
// import { JuiAvatarProps } from 'jui/components/Avatar';

type PrivacyProps = {
  id: number;
  forDisplay?: boolean;
  forAction?: boolean;
};

type PrivacyViewProps = {
  isPublic: boolean;
};

export { PrivacyProps, PrivacyViewProps };
