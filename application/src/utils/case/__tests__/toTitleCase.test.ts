/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-28 17:52:21
 * Copyright © RingCentral. All rights reserved.
 */
import { toTitleCase } from '../toTitleCase';

describe('toTitleCase()', () => {
  it('should transform "unicorns and rainbows" to "Unicorns And Rainbows"', () => {
    expect(toTitleCase('unicorns and rainbows')).toBe('Unicorns and Rainbows');
  });

  it('should transform "UNICORNS AND RAINBOWS" to "Unicorns And Rainbows"', () => {
    expect(toTitleCase('UNICORNS AND RAINBOWS')).toBe('Unicorns and Rainbows');
  });

  it('should transform "unicorns-and-rainbows" to "Unicorns-And-Rainbows"', () => {
    expect(toTitleCase('unicorns-and-rainbows')).toBe('Unicorns-and-Rainbows');
  });

  it('should transform "UNICORNS-AND-RAINBOWS" to "Unicorns-And-Rainbows"', () => {
    expect(toTitleCase('UNICORNS-AND-RAINBOWS')).toBe('Unicorns-and-Rainbows');
  });

  it('should transform "unicorns   and rainbows" to "Unicorns   And Rainbows"', () => {
    expect(toTitleCase('unicorns   and rainbows')).toBe('Unicorns   and Rainbows');
  });
});
