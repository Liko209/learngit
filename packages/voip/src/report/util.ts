/*
 * @Author: Spike.Yang
 * @Date: 2019-05-10 10:58:37
 * Copyright © RingCentral. All rights reserved.
 */
export const KEYS = [
  'jitter',
  'fractionLost',
  'currentRoundTripTime',
  'packetsReceived',
  'bytesReceived',
  'packetsLost',
  'packetsSent',
  'bytesSent',
];

export const deepClone = (arg: any) => JSON.parse(JSON.stringify(arg));

export const defaultItems = () =>
  KEYS.reduce((prev, curr) => {
    prev[curr] = 0;
    return prev;
  }, Object.create(null));

type Sleep = (ms: number) => Promise<void>;
export const sleep: Sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));
