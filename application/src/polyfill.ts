/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-21 14:09:30
 * Copyright © RingCentral. All rights reserved.
 */
// @ts-ignore
import { EventSource } from 'event-source-polyfill';
if (!window['EventSource']) {
  window['EventSource'] = EventSource;
}
if (!window['EventTarget']) {
  window['EventTarget'] = EventTarget;
}
