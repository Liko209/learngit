/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-11 15:15:32
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { JuiVirtualizedList } from '../VirtualizedList';
type TestItemModel = { id: number };

const attachTo = document.createElement('div');
document.body.appendChild(attachTo);

const TestItem = ({ id }: TestItemModel) => {
  return (
    <div key={`KEY_${id}`} style={{ height: 20 }}>
      Item-{id}
    </div>
  );
};

const TestComponent = ({ items }: { items: TestItemModel[] }) => {
  return (
    <JuiVirtualizedList height={100} minRowHeight={20}>
      {items.map(({ id }: TestItemModel) => (
        <TestItem key={`KEY_${id}`} id={id} />
      ))}
    </JuiVirtualizedList>
  );
};

const buildItems = (start: number, stop: number) => {
  return _.range(start, stop + 1).map((i: number) => {
    return {
      id: i,
    };
  });
};

const renderItems = (items: TestItemModel[]) => {
  return items.map(({ id }: TestItemModel) => (
    <TestItem key={`KEY_${id}`} id={id} />
  ));
};

const getRenderedItemIds = (wrapper: ReactWrapper) => {
  return wrapper.find(TestItem).map(itemWrapper => itemWrapper.props().id);
};

const getScrollTop = (wrapper: ReactWrapper) => {
  return wrapper.find(JuiVirtualizedList).getDOMNode().scrollTop;
};

describe('JuiVirtualizedList', () => {
  describe('basic', () => {
    it('should work', () => {
      const items = buildItems(0, 9);
      const wrapper = mount(
        <JuiVirtualizedList height={100} minRowHeight={20}>
          {renderItems(items)}
        </JuiVirtualizedList>,
      );

      expect(getRenderedItemIds(wrapper)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('initial scroll to index', () => {
    let wrapper: ReactWrapper;
    beforeAll(() => {
      const items = buildItems(0, 9);
      wrapper = mount(
        <JuiVirtualizedList
          height={100}
          minRowHeight={20}
          initialScrollToIndex={9}
        >
          {renderItems(items)}
        </JuiVirtualizedList>,
      );
    });

    it('should render items near initial index', () => {
      expect(getRenderedItemIds(wrapper)).toEqual([5, 6, 7, 8, 9]);
    });

    it('should scroll to initial index', () => {
      expect(getScrollTop(wrapper)).toEqual(100);
    });
  });

  describe('children change', () => {
    it('should fix scroll position when prepend items', () => {
      const items: TestItemModel[] = buildItems(10, 19);
      const wrapper = mount(<TestComponent items={items} />);
      wrapper.setProps({ items: [...buildItems(0, 9), ...items] });
      expect(getScrollTop(wrapper)).toBe(200);
    });

    it('should not change scroll position when append items', () => {
      const items: TestItemModel[] = buildItems(0, 9);
      const wrapper = mount(<TestComponent items={items} />);
      wrapper.setProps({ items: [...items, ...buildItems(10, 19)] });
      expect(getScrollTop(wrapper)).toBe(0);
    });
  });
});
