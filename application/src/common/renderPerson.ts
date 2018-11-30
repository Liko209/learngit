/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-13 15:48:11
 * Copyright © RingCentral. All rights reserved.
 */

const renderPerson = (personId: number, personName: string) => {
  return `<a class="at_mention_compose" href="javascript:void(0)" id="${personId}">${personName}</a>`;
};

export { renderPerson };
