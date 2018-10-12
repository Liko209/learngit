import { initAccountPoolManager } from './libs/accounts';

import { ENV_OPTS, DEBUG_MODE } from './config';

export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);
