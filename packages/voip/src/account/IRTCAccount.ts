/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:53:11
 * Copyright © RingCentral. All rights reserved.
 */

interface IRTCAccount {
  isReady(): boolean;
  createOutCallSession(toNum: String): void;
}

export { IRTCAccount };
