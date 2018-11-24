/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';

type PrivacyProps = {
  id: number;
  size?: IconButtonSize;
  isShowTooltip?: boolean;
  isAction?: boolean;
};

type PrivacyViewProps = {
  size: IconButtonSize;
  variant: IconButtonVariant;
  color: string;
  isAction: boolean;
  isPublic: boolean;
  isShowTooltip?: boolean;
  setPrivacy: () => Promise<ServiceCommonErrorType>;
};

export { PrivacyProps, PrivacyViewProps };
