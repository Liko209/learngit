/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-17 17:01:12
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractHandleType, NETWORK_HANDLE_TYPE } from 'foundation/network';

const HandleByCustom = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.CUSTOM;
}();

export default HandleByCustom;
