/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { renderHook } from '../../../../__tests__/renderHook';
import { RowManager } from '../../RowManager';
import { useRowManager } from '../useRowManager';

jest.mock('../../RowManager');

describe('useRowManager()', () => {
  it('should create a instance of RowManager with the keyMapper', () => {
    const keyMapper = jest.fn();
    const options = { keyMapper, minRowHeight: 40 };

    const hookRef = renderHook(() => useRowManager(options));
    const rowManager = hookRef.current;

    expect(rowManager).toBeInstanceOf(RowManager);
    expect(rowManager.setKeyMapper).toHaveBeenCalledWith(keyMapper);
  });
});
