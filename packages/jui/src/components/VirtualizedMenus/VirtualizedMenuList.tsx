/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { useFocusHelper } from '../../foundation/hooks/useFocusHelper';
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
  loop?: boolean;
  autoFocus?: boolean;
  children: JSX.Element[];
  menuItemHeight?: number;
};

function filterElementChildren(children: React.ReactNode) {
  const elementChildren: React.ReactElement<JuiMenuItemProps>[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement<JuiMenuItemProps>(child)) {
      elementChildren.push(child);
    }
  });
  return elementChildren;
}

const JuiVirtualizedMenuList = (props: JuiVirtualizedMenuListProps) => {
  const {
    focusOnHover,
    menuItemHeight = DEFAULT_MENU_ITEM_HEIGHT,
    autoFocus = false,
    loop = true,
  } = props;

  const listRef = useRef<JuiVirtualizedListHandles>();
  const elementChildren = filterElementChildren(props.children);
  const items = elementChildren.map(child => {
    return {
      text: child.props.searchString,
      disabled: child.props.disabled,
    };
  });

  const { focusedIndex, setFocusedIndex, onKeyPress } = useFocusHelper({
    loop,
    items,
  });

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      event.preventDefault();
      onKeyPress(event.key);
    },
    [onKeyPress],
  );

  useLayoutEffect(() => {
    if (listRef.current && focusedIndex !== -1) {
      listRef.current.scrollIntoViewIfNeeded(focusedIndex);
    }
  }, [focusedIndex]);

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
      minRowHeight={menuItemHeight}
      onKeyDown={handleKeyPress}
      tabIndex={autoFocus ? 0 : -1}
    >
      {children}
    </List>
  );
};

export { JuiVirtualizedMenuList, JuiVirtualizedMenuListProps };
