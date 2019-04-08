/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:09
 * Copyright © RingCentral. All rights reserved.
 */
export type UploadRecentLogsViewProps = {};

export type UploadRecentLogsViewModelProps = {
  isUploadingFeedback: boolean;
  openEmail: (subject: string, body: string) => boolean;
  uploadRecentLogs: () => Promise<{
    filename: string;
    handle: string;
    size: number;
    url: string;
  } | null>;
};
