/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-02-13 14:06:29
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-05-31 17:41:14
 */
const faker = require('faker');

function generateFakeItem() {
  return {
    id: faker.random.uuid(),
    name: faker.name.firstName(),
    age: faker.random.number(100),
  };
}

export const randomItems = (count: number, factory: any = null) => {
  const f = factory || generateFakeItem;
  const arr = [];
  for (let i = 0; i < count; i += 1) {
    arr.push(f());
  }
  return arr;
};
