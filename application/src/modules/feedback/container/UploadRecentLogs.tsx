/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:12
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { UploadRecentLogsView } from './UploadRecentLogs.View';
import { UploadRecentLogsViewModel } from './UploadRecentLogs.ViewModel';
import { UploadRecentLogsViewProps } from './types';

import portalManager from '@/common/PortalManager';

const UploadRecentLogsContainer = buildContainer<UploadRecentLogsViewProps>({
  View: UploadRecentLogsView,
  ViewModel: UploadRecentLogsViewModel,
});

const UploadRecentLogs = portalManager.wrapper(UploadRecentLogsContainer);
export { UploadRecentLogs, UploadRecentLogsViewProps };
