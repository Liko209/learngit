/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 10:27:41
 * Copyright © RingCentral. All rights reserved.
 */

interface IProcessor {
  process(): Promise<boolean>;
  canContinue(): boolean;
  name(): string;
  cancel?(): void;
}

export { IProcessor };
