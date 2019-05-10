/*
 * @Author: isaac.liu
 * @Date: 2019-05-06 10:55:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { IntegrationItem } from '../IntegrationItem';
import { mountWithTheme } from '@/__tests__/utils';
import { getEntity } from '@/store/utils';
jest.mock('@/store/utils');

const mockItem = {
  id: 1,
  title: 'this is title',
  body: 'this is body',
};

describe('IntegrationItem', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockImplementation(
      (name: string, id: number) => mockItem,
    );
  });
  it.each(['title', 'body'])(
    'should render %s of integration item JPT-1842~JPT-1874, JPT-1814, JPT-1835, JPT-1837, JPT-1838, JPT-1840, JPT-1841',
    (key: string) => {
      const ids: number[] = [1];
      const view = mountWithTheme(<IntegrationItem ids={ids} />);
      const wrapper = view.find({ 'data-test-automation-id': key });
      expect(wrapper.at(0).text()).toEqual(mockItem[key]);
    },
  );

  it.each(['title', 'body'])(
    'should render markdown %s of integration item JPT-1842~JPT-1874, JPT-1814, JPT-1835, JPT-1837, JPT-1838, JPT-1840, JPT-1841',
    (key: string) => {
      (getEntity as jest.Mock).mockReturnValueOnce({
        [key]: `***${mockItem[key]}***`,
        id: mockItem.id,
      });
      const ids: number[] = [1];
      const view = mountWithTheme(<IntegrationItem ids={ids} />);
      const wrapper = view.find({ 'data-test-automation-id': key });
      expect(wrapper.at(0).text()).toEqual(mockItem[key]);
    },
  );

  it.each(['title', 'body'])(
    'should not render %s when no title JPT-1842~JPT-1874, JPT-1814, JPT-1835, JPT-1837, JPT-1838, JPT-1840, JPT-1841',
    (key: string) => {
      (getEntity as jest.Mock).mockReturnValueOnce({
        id: mockItem.id,
      });
      const ids: number[] = [1];
      const view = mountWithTheme(<IntegrationItem ids={ids} />);
      const wrapper = view.find({ 'data-test-automation-id': key });
      expect(wrapper).toEqual({});
    },
  );
});
