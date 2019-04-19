/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:09
 * Copyright © RingCentral. All rights reserved.
 */
export enum TaskStatus {
  IDLE,
  PENDING,
  EXECUTING,
  FAILED,
  SUCCESS,
}

export type UploadRecentLogsViewProps = {};

export type UploadRecentLogsViewModelProps = {
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
