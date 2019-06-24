/*
 * @Author: Paynter Chen
 * @Date: 2019-04-03 15:40:47
 * Copyright © RingCentral. All rights reserved.
 */
export const JUPITER_ENV = process.env.JUPITER_ENV || 'other';
export const NODE_ENV = process.env.NODE_ENV;
export const GIT_SOURCE_BRANCH = process.env.GIT_SOURCE_BRANCH;
export const GIT_TARGET_BRANCH = process.env.GIT_TARGET_BRANCH;
export const isProductionVersion = ['production', 'public'].includes(
  JUPITER_ENV,
);
// define in application/scripts/
// start.js(development)
// build.js(production)
export const isLocalDevelopment =
  NODE_ENV === 'development' || NODE_ENV !== 'production';

export const isStage = Boolean(
  GIT_SOURCE_BRANCH &&
    GIT_TARGET_BRANCH === GIT_SOURCE_BRANCH &&
    /^stage\/.*/.test(GIT_TARGET_BRANCH),
);
