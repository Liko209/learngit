/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 17:20:01
 * Copyright © RingCentral. All rights reserved.
 */

import {
  compareName,
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  phoneNumberDefaultFormat,
} from 'sdk/utils/helper';

function getShortName(
  firstName: string = '',
  lastName: string = '',
  email?: string,
) {
  if (
    firstName &&
    isOnlyLetterOrNumbers(firstName) &&
    lastName &&
    isOnlyLetterOrNumbers(lastName)
  ) {
    return handleOnlyLetterOrNumbers(firstName, lastName);
  }
  if ((!firstName && lastName) || (firstName && !lastName)) {
    return handleOneOfName(firstName, lastName);
  }
  if (email) {
    return handleOnlyLetterOrNumbers(email, '');
  }
  return '';
}

export {
  compareName,
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  phoneNumberDefaultFormat,
  getShortName,
};
