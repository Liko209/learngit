/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-29 15:44:13
 * Copyright © RingCentral. All rights reserved.
 */

function isDialogOpen() {
  const element = document.querySelector(
    '.MuiDialog-root:not([hidden]):not([role=dialer])',
  );
  return !!element;
}

export { isDialogOpen };
