/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-14 16:00:49
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/models';

export const getName = (item: Person) => {
  if (item.display_name) {
    return item.display_name;
  }
  if (item.first_name && item.last_name) {
    return `${item.first_name} ${item.last_name}`;
  }
  const name = item.email.split('@')[0];
  const firstUpperCase = (parseString: string) => {
    if (!parseString[0]) {
      return '';
    }
    return parseString[0].toUpperCase().concat(parseString.slice(1));
  };

  return name
    .split('.')
    .map((v: string) => firstUpperCase(v))
    .join(' ');
};
