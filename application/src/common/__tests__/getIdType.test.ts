/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:05:00
 * Copyright © RingCentral. All rights reserved.
 */

import { TypeDictionary } from 'sdk/utils';
import { getIdType } from '../getIdType';

describe('Get id type', () => {
  it('should be a team id type', () => {
    const typeId = getIdType(11370502);
    expect(typeId).toBe(TypeDictionary.TYPE_ID_TEAM);
  });

  it('should be a group id type', () => {
    const typeId = getIdType(14974978);
    expect(typeId).toBe(TypeDictionary.TYPE_ID_GROUP);
  });

  it('should be a person id type', () => {
    const typeId = getIdType(2514947);
    expect(typeId).toBe(TypeDictionary.TYPE_ID_PERSON);
  });
});
