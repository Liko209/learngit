/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 18:59:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { createKeyMapper } from '../createKeyMapper';

function setup(keys: React.Key[]) {
  const elements = keys.map(key => <div key={key} />);
  const keyMapper = createKeyMapper(elements);
  return { keyMapper };
}
describe('createKeyMapper()', () => {
  it('should return key of the element', () => {
    const keyMapper = createKeyMapper([
      <div key="KEY_A" />,
      <div key="KEY_B" />,
      <div key="KEY_C" />,
    ]);
    expect(keyMapper(0)).toBe('KEY_A');
    expect(keyMapper(1)).toBe('KEY_B');
    expect(keyMapper(2)).toBe('KEY_C');
  });

  it("should return '' when not found", () => {
    const keyMapper = createKeyMapper([
      <div key="KEY_A" />,
      <div key="KEY_B" />,
      <div key="KEY_C" />,
    ]);
    expect(keyMapper(3)).toBe('');
  });

  it("should return '' when elements is empty", () => {
    const { keyMapper } = setup([]);
    expect(keyMapper(0)).toBe('');
  });
});
