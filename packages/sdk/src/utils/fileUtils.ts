/*
 * @Author: Paynter Chen
 * @Date: 2019-08-27 20:28:59
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

export async function loadFile(): Promise<File> {
  let resolve: any;
  let reject: any;
  const promise = new Promise<File>((r, rj) => {
    resolve = r;
    reject = rj;
  });
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = (e: any) => {
    // getting a hold of the file reference
    input.remove();
    const file = e.target.files[0];
    file ? resolve(file) : reject();
  };

  input.click();
  return promise;
}
