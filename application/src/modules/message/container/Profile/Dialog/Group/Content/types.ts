/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileDialogGroupProps, ProfileDialogGroupViewProps } from '../types';

type ProfileDialogGroupContentProps = ProfileDialogGroupProps;

type ProfileDialogGroupContentViewProps = ProfileDialogGroupViewProps & {
  showMessage: boolean;
  typeId: number;
  showJoinTeam: boolean;
  destinationId: number;
  analysisType: string;
};

export { ProfileDialogGroupContentProps, ProfileDialogGroupContentViewProps };
