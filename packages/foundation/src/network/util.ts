/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:40:58
 * Copyright © RingCentral. All rights reserved.
 */
function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = ((d + Math.random() * 16) % 16) | 0; // eslint-disable-line
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16); // eslint-disable-line
  });
  return uuid;
}

const generateIncrementId = {
  latestId: 1,
  get() {
    if (!this.latestId) {
      this.latestId = 1;
    } else {
      this.latestId += 1;
    }
    return this.latestId.toString();
  },
};

export { generateUUID, generateIncrementId };
