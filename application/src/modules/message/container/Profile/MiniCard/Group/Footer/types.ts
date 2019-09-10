/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ProfileMiniCardGroupProps,
  ProfileMiniCardGroupViewProps,
} from '../types';

type ProfileMiniCardGroupFooterProps = ProfileMiniCardGroupProps;

type ProfileMiniCardGroupFooterViewProps = ProfileMiniCardGroupViewProps & {
  showMessage: boolean;
  analysisType: string;
};

export { ProfileMiniCardGroupFooterProps, ProfileMiniCardGroupFooterViewProps };
