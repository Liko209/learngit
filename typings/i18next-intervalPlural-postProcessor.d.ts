/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 10:59:24
 * Copyright © RingCentral. All rights reserved.
 */

type Options = {
  intervalSeparator: string;
  intervalRegex: RegExp;
  intervalSuffix: string;
};

declare module 'i18next-intervalplural-postprocessor' {
  export var name: 'interval';
  export var type: 'postProcessor';
  export function setOptions(options: Options): void;
  export function process(
    value: any,
    key: any,
    options: Options,
    translator: any,
  ): any;
}
