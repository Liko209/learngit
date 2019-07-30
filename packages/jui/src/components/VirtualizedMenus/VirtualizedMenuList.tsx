/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { useFocusHelper } from '../../foundation/hooks/useFocusHelper';
import { filterReactElement } from '../../foundation/utils/filterReactElement';
import { JuiMenuItemProps } from '../Menus';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from '../VirtualizedList';
import { withAutoSizer } from '../AutoSizer';

const DEFAULT_MENU_ITEM_HEIGHT = 32;
const List = withAutoSizer(JuiVirtualizedList);

type JuiVirtualizedMenuListProps = {
  focusOnHover?: boolean;
  initialFocusedIndex?: number;
  loop?: boolean;
  autoFocus?: boolean;
  children: JSX.Element[];
  menuItemHeight?: number;
};

const JuiVirtualizedMenuList = (props: JuiVirtualizedMenuListProps) => {
  const {
    focusOnHover,
    initialFocusedIndex = -1,
    menuItemHeight = DEFAULT_MENU_ITEM_HEIGHT,
    autoFocus = false,
    loop = true,
  } = props;

  const listRef = useRef<JuiVirtualizedListHandles>();
  const elementChildren = filterReactElement<JuiMenuItemProps>(props.children);

  const items = elementChildren.map(child => {
    return {
      text: child.props.searchString,
      disabled: child.props.disabled,
    };
  });

  const {
    focusedIndex,
    onKeyPress,
    setFocusedIndex: _setFocusedIndex,
  } = useFocusHelper({
    initialFocusedIndex,
    loop,
    items,
  });

  const setFocusedIndex = (index: number) => {
    listRef.current && _setFocusedIndex(index);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault();
      console.log('onKeyPress: ', event.key);
      onKeyPress(event.key);
    },
    [onKeyPress],
  );

  useLayoutEffect(() => {
    if (listRef.current && focusedIndex !== -1) {
      listRef.current.scrollIntoViewIfNeeded(focusedIndex);
      console.log('document.activeElement: ', document.activeElement);
    }
  }, [focusedIndex]);
  console.log('focusedIndex: ', focusedIndex);

  useLayoutEffect(() => {
    if (listRef.current && autoFocus) {
      listRef.current.focus();
    }
  }, [autoFocus]);

  const children = elementChildren.map((child, i) => {
    return React.cloneElement(child, {
      autoFocus: i === focusedIndex,
      onMouseEnter: (event: React.MouseEvent<HTMLLIElement>) => {
        focusOnHover && setFocusedIndex(i);
        child.props.onMouseEnter && child.props.onMouseEnter(event);
      },
      onBlur: (event: React.FocusEvent<HTMLLIElement>) => {
        setTimeout(() => {
          if (document.activeElement === document.body) {
            setFocusedIndex(-1);
          }
        });
        child.props.onBlur && child.props.onBlur(event);
      },
      onClick: (event: React.MouseEvent<HTMLLIElement>) => {
        setFocusedIndex(i);
        child.props.onClick && child.props.onClick(event);
      },
    });
  });

  return (
    <List
      ref={listRef as any}
      onKeyDown={handleKeyDown}
      minRowHeight={menuItemHeight}
      tabIndex={autoFocus ? 0 : -1}
    >
      {children}
    </List>
  );
};

export { JuiVirtualizedMenuList, JuiVirtualizedMenuListProps };
