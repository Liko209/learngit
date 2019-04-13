/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:26
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { AbstractViewModel } from '@/base';
import { observable } from 'mobx';
import { logger } from '../utils';
import { UploadRecentLogsViewModelProps } from './types';
import { FeedbackService } from '../service/FeedbackService';
import { DEFAULT_FEEDBACK_EMAIL } from '../constants';
export class UploadRecentLogsViewModel extends AbstractViewModel
  implements UploadRecentLogsViewModelProps {
  private _feedbackService: FeedbackService = container.get(FeedbackService);
  @observable isUploadingFeedback: boolean = false;
  @observable isFeedbackError: boolean = false;

  openEmail = (subject: string, body: string) => {
    const popupWindow = window.open(
      `mailto:${DEFAULT_FEEDBACK_EMAIL}?subject=${subject}&body=${body}`,
      '_self',
    );
    try {
      popupWindow!.focus();
      return true;
    } catch (e) {
      this.isFeedbackError = true;
      logger.error('Open email fail');
    }
    return false;
  }

  uploadRecentLogs = async () => {
    if (this.isUploadingFeedback) return null;
    this.isUploadingFeedback = true;
    this.isFeedbackError = false;
    try {
      return await this._feedbackService.uploadRecentLogs();
    } catch (error) {
      this.isFeedbackError = true;
      logger.error('Upload recent logs fail');
    } finally {
      this.isUploadingFeedback = false;
    }
    return null;
  }
}
