// This jenkins will create a file name runId and reportUrl

import * as assert from 'assert'
import * as fs from 'fs';
import { URL } from 'url';
import { getLogger } from 'log4js';
import { getOrCreateRunId } from './init';
import { DASHBOARD_URL } from './config';

const logger = getLogger(__filename);
logger.level = 'info';

function getReportUrl(dashboardBaseUrl: string, runId: number) {
  const url = new URL(dashboardBaseUrl);
  return `${url.protocol}//${url.hostname}/run/${runId}`;
}

(async () => {
  try {
    const runId = await getOrCreateRunId();
    assert(runId, 'You must set ENABLE_REMOTE_DASHBOARD=true before calling this script');
    fs.writeFileSync('./runId', String(runId));
    fs.writeFileSync('./reportUrl', getReportUrl(DASHBOARD_URL, runId));
  } catch (err) {
    logger.error('fail to get a runId from dashboard', err);
  }
})();
