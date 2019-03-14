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

const buildScrollTo = (wrapper: ReactWrapper) => {
  return (scrollTop: number) => {
    wrapper.getDOMNode().scrollTop = scrollTop;
    wrapper.simulate('scroll');
  };
};

const buildExpectRangeToBe = (
  wrapper: ReactWrapper,
  handleVisibleRangeChange: jest.Mock,
  handleRenderedRangeChange: jest.Mock,
) => {
  return (startIndex: number, stopIndex: number, changed = true) => {
    expect(getRenderedItemIds(wrapper)).toEqual(
      _.range(startIndex, stopIndex + 1),
    );

    if (changed) {
      expect(handleVisibleRangeChange).toBeCalledWith({
        startIndex,
        stopIndex,
      });
      expect(handleRenderedRangeChange).toBeCalledWith({
        startIndex,
        stopIndex,
      });
    } else {
      expect(handleVisibleRangeChange).not.toBeCalled();
      expect(handleRenderedRangeChange).not.toBeCalled();
    }

    handleVisibleRangeChange.mockClear();
    handleRenderedRangeChange.mockClear();
  };
};

describe('JuiVirtualizedList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic', () => {
    let wrapper: ReactWrapper;
    const handleVisibleRangeChange = jest.fn();
    const handleRenderedRangeChange = jest.fn();

    beforeEach(() => {
      const items = buildItems(0, 9);
      wrapper = mount(
        <JuiVirtualizedList
          height={100}
          minRowHeight={20}
          overscan={0}
          onVisibleRangeChange={handleVisibleRangeChange}
          onRenderedRangeChange={handleRenderedRangeChange}
        >
          {renderItems(items)}
        </JuiVirtualizedList>,
        { attachTo },
      );
    });

    afterEach(() => {
      handleVisibleRangeChange.mockClear();
      wrapper.unmount();
    });

    it('should work', () => {
      expect(getRenderedItemIds(wrapper)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should handle scroll and update list', () => {
      //
      // Simulate scroll and check it's rendered items
      //
      const scrollTo = buildScrollTo(wrapper);
      const expectRangeToBe = buildExpectRangeToBe(
        wrapper,
        handleVisibleRangeChange,
        handleRenderedRangeChange,
      );

      expect.assertions(6 * 3);

      // Scroll to top
      scrollTo(0);
      expectRangeToBe(0, 4, false);

      // Item 5 1px visible
      scrollTo(1);
      expectRangeToBe(0, 5);

      // Item 0 has 1px visible
      scrollTo(19);
      expectRangeToBe(0, 5, false);

      // Item 0 invisible
      // Item 6 invisible
      scrollTo(20);
      expectRangeToBe(1, 5);

      // Item 0 invisible
      // Item 6 has 1px visible
      scrollTo(21);
      expectRangeToBe(1, 6);

      // Scroll to bottom
      scrollTo(99999);
      expectRangeToBe(5, 9);
    });
  });

  describe('initial scroll to index', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      const items = buildItems(0, 9);
      wrapper = mount(
        <JuiVirtualizedList
          height={100}
          minRowHeight={20}
          initialScrollToIndex={9}
        >
          {renderItems(items)}
        </JuiVirtualizedList>,
        { attachTo },
      );
    });

    afterEach(() => {
      wrapper.unmount();
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
      const wrapper = mount(<TestComponent items={items} />, { attachTo });
      wrapper.setProps({ items: [...buildItems(0, 9), ...items] });
      expect(getScrollTop(wrapper)).toBe(200);
      wrapper.unmount();
    });

    it('should not change scroll position when append items', () => {
      const items: TestItemModel[] = buildItems(0, 9);
      const wrapper = mount(<TestComponent items={items} />, { attachTo });
      wrapper.setProps({ items: [...items, ...buildItems(10, 19)] });
      expect(getScrollTop(wrapper)).toBe(0);
      wrapper.unmount();
    });
  });
});
