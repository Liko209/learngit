import React from 'react';
import { mountWithTheme } from 'shield/utils';
import { SETTING_ITEM_TYPE } from '@/interface/setting';
import { Notification } from '@/containers/Notification';
import { SelectSettingItemView } from '../SelectSettingItem.View';
import { SelectSettingItemProps, SelectSettingItemViewProps } from '../types';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';

jest.mock('@/containers/Notification');

type Props = SelectSettingItemProps & SelectSettingItemViewProps<any>;
function setup(customProps: any = {}) {
  const props: Props = {
    id: 'A',
    disabled: false,
    settingItem: {
      id: 'A',
      title: 'itemTitle',
      type: SETTING_ITEM_TYPE.SELECT,
      weight: 0,
    },
    value: { id: 'A' },
    source: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
    saveSetting: jest.fn().mockName('saveSetting()'),
    extractValue: jest
      .fn()
      .mockName('extractValue()')
      .mockImplementation(a => a),
    ...customProps,
  };
  const wrapper = mountWithTheme(<SelectSettingItemView {...props} />);
  const view: any = wrapper.find(SelectSettingItemView).instance();

  return { props, view };
}

describe('SelectSettingItemView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('handleChange()', () => {
    it('should display error when failed to change [JPT-1784]', async () => {
      const { view } = setup({
        saveSetting: jest
          .fn()
          .mockRejectedValue(
            new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, ''),
          ),
      });

      await view.handleChange({ target: { value: 'B' } });

      expect(Notification.flashToast).toHaveBeenCalled();
    });
  });
});
