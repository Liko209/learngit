/*
 * @Author: Paynter Chen
 * @Date: 2019-04-03 20:01:24
 * Copyright © RingCentral. All rights reserved.
 */

export function saveBlob(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
