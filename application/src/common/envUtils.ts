/*
 * @Author: Paynter Chen
 * @Date: 2019-04-03 15:40:47
 * Copyright © RingCentral. All rights reserved.
 */
export const JUPITER_ENV = process.env.JUPITER_ENV || 'Other';
export const NODE_ENV = process.env.NODE_ENV;
export const isProductionVersion = ['production', 'public'].includes(
  JUPITER_ENV,
);
// define in application/scripts/
// start.js(development)
// build.js(production)
export const isLocalDevelopment =
  NODE_ENV === 'development' || NODE_ENV !== 'production';
