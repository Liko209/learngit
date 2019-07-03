/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-27 14:55:59
 * Copyright © RingCentral. All rights reserved.
 */

const SPARTA_TIME_RANGE = [
  {
    low: 2,
    high: 6,
  },
  { low: 10, high: 20 },
  { low: 20, high: 40 },
  { low: 40, high: 80 },
  { low: 80, high: 120 }, // 5 times
  { low: 80, high: 120 },
  { low: 80, high: 120 },
  { low: 80, high: 120 },
  { low: 80, high: 120 },
  { low: 2 * 60, high: 4 * 60 },
  { low: 4 * 60, high: 8 * 60 },
  { low: 8 * 60, high: 16 * 60 },
  { low: 18 * 60, high: 32 * 60 },
  { low: 32 * 60, high: 64 * 60 },
];

function getSpartaRandomTime(count: number, isMillisecondUnit: boolean) {
  if (count < 1) {
    return 0;
  }
  const value =
    count >= SPARTA_TIME_RANGE.length
      ? SPARTA_TIME_RANGE[SPARTA_TIME_RANGE.length - 1]
      : SPARTA_TIME_RANGE[count - 1];

  const result =
    Math.ceil(Math.random() * (value.high - value.low)) + value.low;
  return isMillisecondUnit ? result * 1000 : result;
}

export { SPARTA_TIME_RANGE, getSpartaRandomTime };
