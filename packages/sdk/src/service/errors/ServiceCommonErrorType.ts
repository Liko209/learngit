/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-09-11 15:51:29
 * Copyright © RingCentral. All rights reserved.
 */

enum ServiceCommonErrorType {
  NONE = 0,
  NETWORK_NOT_AVAILABLE = 1,
  SERVER_ERROR = 2,
  UNKNOWN_ERROR = 99,
}

export default ServiceCommonErrorType;
