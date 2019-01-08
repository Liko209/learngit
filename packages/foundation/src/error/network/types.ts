/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:54:09
 * Copyright © RingCentral. All rights reserved.
 */
import { JError, ERROR_TYPES } from '../types';

export class JNetworkError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.NETWORK, code, message, payload);
  }
}

export const ERROR_CODES_NETWORK = {
  GENERAL: 'GENERAL_ERROR',
  NOT_NETWORK: 'NOT_NETWORK',
  NETWORK_ERROR: 'NETWORK_ERROR',
  // 4XX client errors
  BAD_REQUEST: 'HTTP_400', // Bad Request
  UNAUTHORIZED: 'HTTP_401', // Unauthorized
  PAYMENT_REQUIRED: 'HTTP_402', // Payment Required
  FORBIDDEN: 'HTTP_403', // Forbidden
  NOT_FOUND: 'HTTP_404', // Not Found
  METHOD_NOT_ALLOWED: 'HTTP_405', // Method Not Allowed
  NOT_ACCEPTABLE: 'HTTP_406', // Not Acceptable
  PROXY_AUTHENTICATION_REQUIRED: 'HTTP_407', // Proxy Authentication Required
  REQUEST_TIMEOUT: 'HTTP_408', // Request Timeout
  CONFLICT: 'HTTP_409', // Conflict
  GONE: 'HTTP_410', // Gone
  LENGTH_REQUIRED: 'HTTP_411', // Length Required
  PRECONDITION_FAIL: 'HTTP_412', // Precondition Fail
  PAYLOAD_TOO_LARGE: 'HTTP_413', // Payload Too Large
  URI_TOO_LONG: 'HTTP_414', // URI Too Long
  UNSUPPORTED_MEDIA_TYPE: 'HTTP_415', // Unsupported Media Type
  RANGE_NOT_SATISFIABLE: 'HTTP_416', // Range Not Satisfiable
  // 5xx server errors
  INTERNAL_SERVER_ERROR: 'HTTP_500', // Internal Server Error
  NOT_IMPLEMENTED: 'HTTP_501', // Not Implemented
  BAD_GATEWAY: 'HTTP_502', // Bad Gateway
  SERVICE_UNAVAILABLE: 'HTTP_503', // Service Unavailable
  GATEWAY_TIMEOUT: 'HTTP_504', // Gateway Timeout
  HTTP_VERSION_NOT_SUPPORTED: 'HTTP_505', // HTTP Version Not Supported
  VARIANT_ALSO_NEGOTIATES: 'HTTP_506', // Variant Also Negotiates
  INSUFFICIENT_STORAGE: 'HTTP_507', // Insufficient Storage
  LOOP_DETECTED: 'HTTP_508', // Loop Detected
  NOT_EXTENDED: 'HTTP_510', // Not Extended
  NETWORK_AUTHENTICATION_REQUIRED: 'HTTP_511', // Network Authentication Required
};
