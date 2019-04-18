import { FeedbackData } from './types';
import axios from 'axios';
import { SENTRY_FEEDBACK_API_KEY } from './constants';
import { isProductionVersion } from '@/common/envUtils';
const PROJECT_NAME = 'web';
const PROJECT_NAME_DEVELOPMENT = 'web-development';

export class FeedbackApi {
  private static _getAuthHeader = () => {
    return {
      Authorization: `Bearer ${SENTRY_FEEDBACK_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  static sendFeedback = async (data: FeedbackData) => {
    return await axios.post(
      `/sentry/api/0/projects/jupiter-ct/${
        isProductionVersion ? PROJECT_NAME : PROJECT_NAME_DEVELOPMENT
      }/user-feedback/`,
      data,
      {
        headers: FeedbackApi._getAuthHeader(),
      },
    );
  }
}
