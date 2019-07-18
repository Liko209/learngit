/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */

const Utils = {
  isValidVolume: (vol: number) => vol <= 1 && vol >= 0,
  intersection: (a: string[], b: string[]) => a.filter(v => b.includes(v)),
  difference: (a: string[], b: string[]) => a.concat(b).filter(v => !a.includes(v) || !b.includes(v)),
};

export { Utils };
