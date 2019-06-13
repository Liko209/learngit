/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:09
 * Copyright © RingCentral. All rights reserved.
 */

import { ZipItemLevel } from 'sdk/service/uploadLogControl/types';

export enum TaskStatus {
  IDLE,
  PENDING,
  EXECUTING,
  FAILED,
  SUCCESS,
}

export type UploadRecentLogsViewProps = {
  level?: ZipItemLevel;
};

export type UploadRecentLogsViewModelProps = UploadRecentLogsViewProps & {
  uploadLogsStatus: TaskStatus;
  sendFeedbackStatus: TaskStatus;
  isLoading: boolean;
  issueTitle: string;
  issueDescription: string;
  sendFeedback: () => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendFeedbackDone: (callback: (taskStatus: TaskStatus) => void) => void;
};
