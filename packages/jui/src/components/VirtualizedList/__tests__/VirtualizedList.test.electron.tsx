/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-11 15:15:32
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import styled from '../../../foundation/styled-components';
import { JuiAutoSizer, Size } from '../../AutoSizer/AutoSizer';
import { JuiVirtualizedList } from '../VirtualizedList';

type TestItemModel = { id: number };

const attachTo = document.createElement('div');
attachTo.className = 'attachTo';
document.body.appendChild(attachTo);
const style = document.createElement('style');
style.innerHTML = `
  html, body {
    position: relative;
    height: 1000px;
  }

  .attachTo {
    height: 100%;
  }
`;
document.body.appendChild(style);
const bodyHeight = document.body.offsetHeight;

const ListWrapper = styled.div`
  height: 100px;
`;

const TestItem = ({ id }: TestItemModel) => {
  return (
    <div key={`KEY_${id}`} style={{ height: 20 }}>
      Item-{id}
    </div>
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
    const virtualizedList = wrapper.find(JuiVirtualizedList);
    virtualizedList.getDOMNode().scrollTop = scrollTop;
    virtualizedList.simulate('scroll');
  };
};

const buildExpect = (
  wrapper: ReactWrapper,
  handleVisibleRangeChange: jest.Mock,
  handleRenderedRangeChange: jest.Mock,
) => {
  return {
    expectItemsToBeRendered: (startIndex: number, stopIndex: number) => {
      expect(getRenderedItemIds(wrapper)).toEqual(
        _.range(startIndex, stopIndex + 1),
      );
    },
    expectRangeChangeEventCalledWith: (
      startIndex: number,
      stopIndex: number,
    ) => {
      expect(handleVisibleRangeChange.mock.calls[0][0]).toEqual({
        startIndex,
        stopIndex,
      });
      expect(handleRenderedRangeChange).toHaveBeenCalledWith({
        startIndex,
        stopIndex,
      });
      handleVisibleRangeChange.mockClear();
      handleRenderedRangeChange.mockClear();
    },
    expectRangeChangeEventNotToBeCalled: () => {
      expect(handleVisibleRangeChange).not.toHaveBeenCalled();
      expect(handleRenderedRangeChange).not.toHaveBeenCalled();
      handleVisibleRangeChange.mockClear();
      handleRenderedRangeChange.mockClear();
    },
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
        <ListWrapper>
          <JuiVirtualizedList
            height={100}
            minRowHeight={20}
            overscan={0}
            onVisibleRangeChange={handleVisibleRangeChange}
            onRenderedRangeChange={handleRenderedRangeChange}
          >
            {renderItems(items)}
          </JuiVirtualizedList>
        </ListWrapper>,
        { attachTo },
      );
    });

    afterEach(() => {
      handleVisibleRangeChange.mockClear();
      handleRenderedRangeChange.mockClear();
      wrapper.unmount();
    });

    it('should work', () => {
      expect(getRenderedItemIds(wrapper)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should handle scroll and update list', () => {
      const {
        expectItemsToBeRendered,
        expectRangeChangeEventCalledWith,
        expectRangeChangeEventNotToBeCalled,
      } = buildExpect(
        wrapper,
        handleVisibleRangeChange,
        handleRenderedRangeChange,
      );

      //
      // Simulate scroll and check it's rendered items
      //
      const scrollTo = buildScrollTo(wrapper);

      expectRangeChangeEventCalledWith(0, 4);

      // Scroll to top
      scrollTo(0);
      expectItemsToBeRendered(0, 4);
      expectRangeChangeEventNotToBeCalled();

      // Item 5 1px visible
      scrollTo(1);
      expectItemsToBeRendered(0, 5);
      expectRangeChangeEventCalledWith(0, 5);

      // Item 0 has 1px visible
      scrollTo(19);
      expectItemsToBeRendered(0, 5);
      expectRangeChangeEventNotToBeCalled();

      // Item 0 invisible
      // Item 6 invisible
      scrollTo(20);
      expectItemsToBeRendered(1, 5);
      expectRangeChangeEventCalledWith(1, 5);

      // Item 0 invisible
      // Item 6 has 1px visible
      scrollTo(21);
      expectItemsToBeRendered(1, 6);
      expectRangeChangeEventCalledWith(1, 6);

      // Scroll to bottom
      scrollTo(99999);
      expectItemsToBeRendered(5, 9);
      expectRangeChangeEventCalledWith(5, 9);
    });
  });

  describe.skip('initialScrollToIndex', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      const items = buildItems(0, 9);
      wrapper = mount(
        <ListWrapper>
          <JuiVirtualizedList
            height={100}
            minRowHeight={20}
            overscan={0}
            initialScrollToIndex={9}
          >
            {renderItems(items)}
          </JuiVirtualizedList>
        </ListWrapper>,
        { attachTo },
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should render items near initial index', () => {
      expect(getRenderedItemIds(wrapper)).toEqual([5, 6, 7, 8, 9]);
    });

    it.skip('should scroll to initial index', () => {
      expect(getScrollTop(wrapper)).toEqual(100);
    });
  });

  describe('overscan', () => {
    it.each`
      initialScrollToIndex | overscan | renderedItems
      ${0}                 | ${1}     | ${[0, 1, 2, 3, 4, 5]}
      ${0}                 | ${2}     | ${[0, 1, 2, 3, 4, 5, 6]}
      ${0}                 | ${3}     | ${[0, 1, 2, 3, 4, 5, 6, 7]}
      ${0}                 | ${4}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8]}
      ${0}                 | ${5}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
      ${0}                 | ${999}   | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
      ${3}                 | ${0}     | ${[3, 4, 5, 6, 7]}
      ${3}                 | ${1}     | ${[2, 3, 4, 5, 6, 7, 8]}
      ${3}                 | ${2}     | ${[1, 2, 3, 4, 5, 6, 7, 8, 9]}
      ${3}                 | ${3}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
    `(
      `should render more items than visible
        props: { initialScrollToIndex: $initialScrollToIndex, overscan: $overscan }`,
      ({ initialScrollToIndex, overscan, renderedItems }) => {
        const wrapper = mount(
          <ListWrapper>
            <JuiVirtualizedList
              height={100}
              minRowHeight={20}
              initialScrollToIndex={initialScrollToIndex}
              overscan={overscan}
            >
              {renderItems(buildItems(0, 9))}
            </JuiVirtualizedList>
          </ListWrapper>,
          { attachTo },
        );

        expect(getRenderedItemIds(wrapper)).toEqual(renderedItems);
        wrapper.unmount();
      },
    );
  });

  describe('children change', () => {
    const TestComponent = ({ items }: { items: TestItemModel[] }) => {
      return (
        <ListWrapper>
          <JuiVirtualizedList height={100} minRowHeight={20}>
            {items.map(({ id }: TestItemModel) => (
              <TestItem key={`KEY_${id}`} id={id} />
            ))}
          </JuiVirtualizedList>
        </ListWrapper>
      );
    };

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

  describe('using with JuiAutoSizer', () => {
    it('should work with auto sizer', () => {
      const wrapper = mount(
        <ListWrapper>
          <JuiAutoSizer>
            {({ height }: Size) => (
              <JuiVirtualizedList
                height={height}
                minRowHeight={20}
                initialScrollToIndex={0}
                overscan={0}
              >
                {renderItems(buildItems(0, 999))}
              </JuiVirtualizedList>
            )}
          </JuiAutoSizer>
        </ListWrapper>,
        { attachTo },
      );

      expect(getRenderedItemIds(wrapper)).toEqual([
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
      ]);

      wrapper.unmount();
    });

    it.each`
      parentMinHeight | itemCount | renderedItems         | expectedHeight
      ${100}          | ${0}      | ${[]}                 | ${100}
      ${100}          | ${1}      | ${[0]}                | ${100}
      ${100}          | ${2}      | ${[0, 1]}             | ${100}
      ${100}          | ${3}      | ${[0, 1, 2]}          | ${100}
      ${100}          | ${5}      | ${[0, 1, 2, 3, 4]}    | ${100}
      ${100}          | ${6}      | ${[0, 1, 2, 3, 4, 5]} | ${120}
    `(
      'should work when parent has minHeight. itemCount: $itemCount',
      ({ parentMinHeight, itemCount, expectedHeight, renderedItems }) => {
        const wrapper = mount(
          <div style={{ minHeight: parentMinHeight }}>
            <JuiAutoSizer>
              {({ height }: Size) => (
                <JuiVirtualizedList
                  height={height}
                  minRowHeight={20}
                  initialScrollToIndex={0}
                  overscan={0}
                >
                  {renderItems(buildItems(0, itemCount - 1))}
                </JuiVirtualizedList>
              )}
            </JuiAutoSizer>
          </div>,
          { attachTo },
        );

        expect(getComputedStyle(wrapper.getDOMNode()).height).toBe(
          `${expectedHeight}px`,
        );
        expect(getRenderedItemIds(wrapper)).toEqual(renderedItems);
        wrapper.unmount();
      },
    );

    it.each`
      parentMaxHeight | itemCount | renderedItems                     | expectedHeight
      ${100}          | ${0}      | ${[]}                             | ${0}
      ${100}          | ${1}      | ${[0]}                            | ${20}
      ${100}          | ${2}      | ${[0, 1]}                         | ${40}
      ${100}          | ${3}      | ${[0, 1, 2]}                      | ${60}
      ${100}          | ${10}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${100}
      ${100}          | ${99}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${100}
    `(
      'should work when parent has maxHeight. itemCount: $itemCount',
      ({ parentMaxHeight, itemCount, expectedHeight, renderedItems }) => {
        const wrapper = mount(
          <div style={{ maxHeight: parentMaxHeight }}>
            <JuiAutoSizer>
              {({ height }: Size) => (
                <JuiVirtualizedList
                  height={height}
                  minRowHeight={20}
                  initialScrollToIndex={0}
                  overscan={0}
                >
                  {renderItems(buildItems(0, itemCount - 1))}
                </JuiVirtualizedList>
              )}
            </JuiAutoSizer>
          </div>,
          { attachTo },
        );

        expect(
          getComputedStyle(wrapper.find(JuiVirtualizedList).getDOMNode())
            .height,
        ).toBe(`${expectedHeight}px`);
        expect(getRenderedItemIds(wrapper)).toEqual(renderedItems);
        wrapper.unmount();
      },
    );

    it.each`
      parentMaxHeight | itemCount | renderedItems                     | expectedHeight
      ${'50%'}        | ${0}      | ${[]}                             | ${0}
      ${'50%'}        | ${1}      | ${[0]}                            | ${20}
      ${'50%'}        | ${2}      | ${[0, 1]}                         | ${40}
      ${'50%'}        | ${3}      | ${[0, 1, 2]}                      | ${60}
      ${'50%'}        | ${10}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${200}
      ${'50%'}        | ${24}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${480}
      ${'50%'}        | ${25}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${bodyHeight / 2}
      ${'50%'}        | ${26}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${bodyHeight / 2}
      ${'50%'}        | ${99}     | ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${bodyHeight / 2}
    `(
      'should work when parent has percentage maxHeight. itemCount: $itemCount',
      ({ parentMaxHeight, itemCount, expectedHeight, renderedItems }) => {
        const wrapper = mount(
          <div
            style={{
              maxHeight: parentMaxHeight,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <JuiAutoSizer>
              {({ height }: Size) => (
                <JuiVirtualizedList
                  height={height}
                  minRowHeight={20}
                  initialScrollToIndex={0}
                  overscan={0}
                >
                  {renderItems(buildItems(0, itemCount - 1))}
                </JuiVirtualizedList>
              )}
            </JuiAutoSizer>
          </div>,
          { attachTo },
        );
        expect(
          getComputedStyle(wrapper.find(JuiVirtualizedList).getDOMNode())
            .height,
        ).toBe(`${expectedHeight}px`);
        expect(getRenderedItemIds(wrapper)).toEqual(renderedItems);
        wrapper.unmount();
      },
    );
  });
});
