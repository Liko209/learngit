/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-17 17:01:12
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';

import {
  IRequest,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
} from 'foundation';

const HandleByCustom = new class extends AbstractHandleType {
  defaultVia = NETWORK_VIA.HTTP;
  survivalModeSupportable = true;
  requestDecoration(tokenHandler: ITokenHandler) {
    return (request: IRequest) => {
      return request;
    };
  }
}();

export default HandleByCustom;
