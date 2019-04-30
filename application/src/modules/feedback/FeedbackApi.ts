import { FeedbackData } from './types';
import axios from 'axios';
import { SENTRY_FEEDBACK_API_KEY } from './constants';
import { JUPITER_ENV } from '@/common/envUtils';

const ENV_PROJECT_MAP = {
  development: 'web-development',
  production: 'web-acceptance',
  public: 'web',
};

export class FeedbackApi {
  private static _getAuthHeader = () => {
    return {
      Authorization: `Bearer ${SENTRY_FEEDBACK_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  static sendFeedback = async (data: FeedbackData) => {
    return await axios.post(
      `/sentry/api/0/projects/jupiter-ct/${ENV_PROJECT_MAP[JUPITER_ENV] ||
        ENV_PROJECT_MAP['development']}/user-feedback/`,
      data,
      {
        headers: FeedbackApi._getAuthHeader(),
      },
    );
  }
}
