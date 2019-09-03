/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { renderHook } from '../../../../__tests__/renderHook';
import { DynamicRowManager } from '../../DynamicRowManager';
import { useRowManager } from '../useRowManager';

jest.mock('../../DynamicRowManager');

describe('useRowManager()', () => {
  it('should create a instance of RowManager with the keyMapper', () => {
    const keyMapper = jest.fn();
    const options = { keyMapper, minRowHeight: 40 };

    const hookRef = renderHook(() => useRowManager(options));
    const rowManager = hookRef.current;

    expect(rowManager).toBeInstanceOf(DynamicRowManager);
    if (rowManager instanceof DynamicRowManager) {
      expect(rowManager.setKeyMapper).toHaveBeenCalledWith(keyMapper);
    }
  });
});
