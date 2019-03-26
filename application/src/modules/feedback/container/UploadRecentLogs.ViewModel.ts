/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:26
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { observable } from 'mobx';
import { LogControlManager, mainLogger } from 'sdk';
import { UploadRecentLogsViewModelProps } from './types';
const DEFAULT_FEEDBACK_EAMIL = 'paynter.chen@ringcentral.com';
export class UploadRecentLogsViewModel extends AbstractViewModel
  implements UploadRecentLogsViewModelProps {
  @observable isUploadingFeedback: boolean = false;
  @observable isFeedbackError: boolean = false;

  openEmail = (subject: string, body: string) => {
    const popupWindow = window.open(
      `mailto:${DEFAULT_FEEDBACK_EAMIL}?subject=${subject}&body=${body}`,
      '_self',
    );
    try {
      popupWindow!.focus();
      return true;
    } catch (e) {
      this.isFeedbackError = true;
      mainLogger.error('Open email fail');
    }
    return false;
  }

  uploadRecentLogs = async () => {
    if (this.isUploadingFeedback) return null;
    this.isUploadingFeedback = true;
    this.isFeedbackError = false;
    try {
      const uploadResult = await LogControlManager.instance().uploadMemoryLogs();
      return uploadResult;
    } catch (error) {
      this.isFeedbackError = true;
      mainLogger.error('Upload recent logs fail');
    } finally {
      this.isUploadingFeedback = false;
    }
    return null;
  }
}
