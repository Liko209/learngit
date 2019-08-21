/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';

type PrivacyProps = {
  id: number; // teamId
  size?: IconButtonSize;
  analysisSource: string;
};

type PrivacyViewProps = {
  isPublic: boolean;
  isAdmin: boolean;
  isTeam: boolean;
  handlePrivacy: () => Promise<void>;
};

export { PrivacyProps, PrivacyViewProps };
