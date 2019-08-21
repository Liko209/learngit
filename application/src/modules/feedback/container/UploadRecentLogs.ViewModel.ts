/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:26
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { AbstractViewModel } from '@/base';
import { observable, computed, action } from 'mobx';
import { logger } from '../utils';
import { UploadRecentLogsViewModelProps, TaskStatus } from './types';
import { UploadResult } from '../types';
import { FeedbackService } from '../service/FeedbackService';
import { TaskQueueLoop, Task } from 'sdk/module/log/consumer/task';
import { Nullable } from 'sdk/types';

const TASK_NAME = {
  UPLOAD_LOGS: 'UPLOAD_LOGS',
  SEND_FEEDBACK: 'SEND_FEEDBACK',
};

export const isTaskInQueue = (taskStatus: TaskStatus) => {
  return [TaskStatus.PENDING, TaskStatus.EXECUTING].includes(taskStatus);
};

export class UploadRecentLogsViewModel
  extends AbstractViewModel<UploadRecentLogsViewModelProps>
  implements UploadRecentLogsViewModelProps {
  private _uploadLogResult: Nullable<UploadResult>;
  private _taskQueue: TaskQueueLoop;
  private _onSendFeedbackDoneCallback: (taskStatus: TaskStatus) => void;
  @observable uploadLogsStatus: TaskStatus = TaskStatus.IDLE;
  @observable sendFeedbackStatus: TaskStatus = TaskStatus.IDLE;
  @observable issueTitle: string = '';
  @observable issueDescription: string = '';

  constructor(props: UploadRecentLogsViewModelProps) {
    super(props);
    this._taskQueue = new TaskQueueLoop();
    this.uploadLogsStatus = TaskStatus.PENDING;
    this._taskQueue.addTail(this._createUploadLogsTask());
  }

  private _createUploadLogsTask = () => {
    return new Task({
      name: TASK_NAME.UPLOAD_LOGS,
      onExecute: async () => {
        this.uploadLogsStatus = TaskStatus.EXECUTING;
        logger.debug('upload recent logs start');
        await this._uploadRecentLogs();
      },
      onCompleted: async () => {
        this.uploadLogsStatus = TaskStatus.SUCCESS;
        logger.debug('upload recent logs success');
      },
      onError: async error => {
        this.uploadLogsStatus = TaskStatus.FAILED;
        logger.debug('upload recent logs failed', error);
      },
    });
  };

  private _createSendFeedbackTask = () => {
    return new Task({
      name: TASK_NAME.SEND_FEEDBACK,
      onExecute: async () => {
        this.sendFeedbackStatus = TaskStatus.EXECUTING;
        logger.debug('send feedback start');
        await this._sendFeedback();
      },
      onCompleted: async () => {
        this.sendFeedbackStatus = TaskStatus.SUCCESS;
        logger.debug('send feedback success');
        this._onSendFeedbackDoneCallback &&
          this._onSendFeedbackDoneCallback(TaskStatus.SUCCESS);
      },
      onError: async error => {
        this.sendFeedbackStatus = TaskStatus.FAILED;
        logger.debug('Send feedback fail', error);
        this._onSendFeedbackDoneCallback &&
          this._onSendFeedbackDoneCallback(TaskStatus.FAILED);
      },
    });
  };

  private _sendFeedback = async (): Promise<void> => {
    const feedbackService: FeedbackService = container.get(FeedbackService);
    const uploadResult = this._uploadLogResult;
    if (uploadResult) {
      const comments = `Describe your problem here:\n\n${
        this.issueDescription
      }\n---\nID: ${uploadResult.handle}\nFile: ${uploadResult.filename}\nurl:${
        uploadResult.url
      }`;
      await feedbackService.sendFeedback(this.issueTitle, comments);
    } else {
      logger.debug('Send feedback without recent logs');
      await feedbackService
        .sendFeedback(this.issueTitle, this.issueDescription)
        .catch();
      throw new Error('upload step failed, can not send feedback.');
    }
  };
  @action
  private _uploadRecentLogs = async () => {
    const feedbackService: FeedbackService = container.get(FeedbackService);
    this._uploadLogResult = null;
    this._uploadLogResult = await feedbackService.uploadRecentLogs({
      level: this.props.level,
    });
    if (!this._uploadLogResult) {
      logger.debug('Upload recent logs failed.');
      throw new Error('Upload recent logs failed.');
    }
  };

  @computed get isLoading() {
    return isTaskInQueue(this.sendFeedbackStatus);
  }

  onSendFeedbackDone = (callback: (taskStatus: TaskStatus) => void) => {
    this._onSendFeedbackDoneCallback = callback;
  };

  sendFeedback = () => {
    if (
      !(
        isTaskInQueue(this.uploadLogsStatus) ||
        this.uploadLogsStatus === TaskStatus.SUCCESS
      )
    ) {
      this.uploadLogsStatus = TaskStatus.PENDING;
      this._taskQueue.addTail(this._createUploadLogsTask());
    }
    if (!isTaskInQueue(this.sendFeedbackStatus)) {
      this.sendFeedbackStatus = TaskStatus.PENDING;
      this._taskQueue.addTail(this._createSendFeedbackTask());
    }
  };

  handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.issueTitle = e.target.value.trim();
  };

  handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.issueDescription = e.target.value.trim();
  };
}
