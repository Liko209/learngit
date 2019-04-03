/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:26:01
 * Copyright © RingCentral. All rights reserved.
 */
import { dateFormatter, formatSeconds } from '../';

describe('dateFormatter', () => {
  it('format date', () => {
    expect(dateFormatter.date(1547086968632)).toBe('1/10/2019');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(1);
    expect(secondTime).toBe('01');
    expect(minuteTime).toBe('00');
    expect(hourTime).toBe('00');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(50);
    expect(secondTime).toBe('50');
    expect(minuteTime).toBe('00');
    expect(hourTime).toBe('00');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(60);
    expect(secondTime).toBe('00');
    expect(minuteTime).toBe('01');
    expect(hourTime).toBe('00');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(61);
    expect(secondTime).toBe('01');
    expect(minuteTime).toBe('01');
    expect(hourTime).toBe('00');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(3600);
    expect(secondTime).toBe('00');
    expect(minuteTime).toBe('00');
    expect(hourTime).toBe('01');
  });

  it('format seconds', () => {
    const { secondTime, minuteTime, hourTime } = formatSeconds(3661);
    expect(secondTime).toBe('01');
    expect(minuteTime).toBe('01');
    expect(hourTime).toBe('01');
  });
});
