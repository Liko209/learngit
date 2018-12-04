/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';

type PrivacyProps = {
  id: number; // teamId
  size?: IconButtonSize;
  disableToolTip?: boolean;
  isAction?: boolean;
};

type PrivacyViewProps = {
  size: IconButtonSize;
  variant: IconButtonVariant;
  color: string;
  isAction: boolean;
  isPublic: boolean;
  handlePrivacy: () => Promise<ServiceCommonErrorType>;
  disableToolTip?: boolean;
};

export { PrivacyProps, PrivacyViewProps };
