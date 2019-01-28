/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 16:00:22
 * Copyright © RingCentral. All rights reserved.
 */
function preloadImg(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.style.display = 'none';

    img.onload = function () {
      document.body.removeChild(img);
      resolve();
    };

    img.onerror = function () {
      document.body.removeChild(img);
      reject();
    };

    img.src = url;
    document.body.appendChild(img);
  });
}

export { preloadImg };
