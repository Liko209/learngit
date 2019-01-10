/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:26:38
 * Copyright © RingCentral. All rights reserved.
 */
interface IConditionalHandler {
  onReadyWhenRegSucceedAction(): void;
  onProvisionReadyAction(provisionData: any, options: any): void;
  onReRegisterAction(): void;
}

export { IConditionalHandler };
