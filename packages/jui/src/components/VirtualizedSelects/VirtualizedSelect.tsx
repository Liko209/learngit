/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 18:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

import { Input } from '@material-ui/core';
import { usePopupHelper } from '../../foundation/hooks/usePopupHelper';
import { filterReactElement } from '../../foundation/utils/filterReactElement';
import { JuiMenuItemProps } from '../Menus/MenuItem';
import { HeightSize } from '../Selects/BoxSelect/types';
import { JuiVirtualizedMenu } from '../VirtualizedMenus';
import { ArrowDropDownIcon } from './ArrowDropDownIcon';
import { StyledInput } from './styles';

type JuiVirtualizedSelectProps<V = string | number | string[] | undefined> = {
  name?: string;
  value: V;
  input?: JSX.Element;
  children: JSX.Element[];
  renderValue?: (value: V) => React.ReactNode;
  heightSize?: HeightSize;
  onChange?: (
    event: React.ChangeEvent<{ name?: string; value: V }>,
    child: React.ReactNode,
  ) => void;
};

const defaultInput = <Input />;

const useSingleSelectHelper = <T extends any>(value?: T) => {
  const [selected, setSelected] = useState<T | undefined>(value);
  return { selected, setSelected };
};

const JuiVirtualizedSelect = (props: JuiVirtualizedSelectProps) => {
  const { name, value, renderValue, input = defaultInput } = props;
  const elementChildren = filterReactElement<JuiMenuItemProps>(props.children);
  const displayRef = useRef<HTMLDivElement>(null);
  const [minWidth, setMinWidth] = useState(120);
  const popupHelper = usePopupHelper({ minWidth, variant: 'popper' });
  const selectHelper = useSingleSelectHelper(value);

  const buildItemClickHandler = (
    child: React.ReactElement<JuiMenuItemProps>,
  ) => (event: any) => {
    const newValue = child.props.value;
    child.props.onClick && child.props.onClick(event);
    popupHelper.close();
    selectHelper.setSelected(child.props.value);
    event.persist();
    event.target = { value: newValue, name };
    props.onChange && props.onChange(event, child);
  };

  const children = elementChildren.map(child => {
    return React.cloneElement(child, {
      selected: child.props.value === selectHelper.selected,
      role: 'option',
      onClick: buildItemClickHandler(child),
    });
  });

  const selectedIndex = children.findIndex(
    child => child.props.value === selectHelper.selected,
  );

  useEffect(() => {
    if (!popupHelper.PopperProps.open && displayRef.current) {
      displayRef.current.focus();
    }
  }, [popupHelper.PopperProps.open]);

  useLayoutEffect(() => {
    if (displayRef.current) {
      setMinWidth(displayRef.current.clientWidth);
    }
  }, [displayRef.current]);

  return React.cloneElement(input, {
    inputComponent: (props: { children: React.ReactNode }) => (
      <>
        <StyledInput
          ref={displayRef as any}
          {...props}
          {...popupHelper.SelectTriggerProps}
        >
          {renderValue ? renderValue(value) : value}
        </StyledInput>
        <JuiVirtualizedMenu
          {...popupHelper.SelectMenuProps}
          initialFocusedIndex={Math.max(selectedIndex, 0)}
        >
          {children}
        </JuiVirtualizedMenu>
        <ArrowDropDownIcon />
      </>
    ),
    select: true,
    inputProps: {
      children,
      type: undefined, // We render a select. We can ignore the type provided by the `Input`.
    },
  });
};

export { JuiVirtualizedSelect, JuiVirtualizedSelectProps };
