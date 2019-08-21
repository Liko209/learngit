/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 18:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Input } from '@material-ui/core';
import { MenuProps } from '@material-ui/core/Menu';
import { usePopupHelper } from '../../foundation/hooks/usePopupHelper';
import { filterReactElement } from '../../foundation/utils/filterReactElement';
import { JuiMenuItemProps } from '../Menus/MenuItem';
import { HeightSize } from '../Selects/BoxSelect/types';
import { JuiVirtualizedMenu } from '../VirtualizedMenus';
import { ArrowDropDownIcon } from './ArrowDropDownIcon';
import { StyledInput } from './styles';

type JuiVirtualizedSelectInputProps<
  V = string | number | string[] | undefined
> = {
  name?: string;
  value: V;
  automationId: string;
  children: JSX.Element[];
  renderValue?: (value: V) => React.ReactNode;
  label?: string;
  heightSize?: HeightSize;
  disabled?: boolean;
  MenuProps?: Partial<MenuProps>;
  onChange?: (
    event: React.ChangeEvent<{ name?: string; value: V }>,
    child: React.ReactNode,
  ) => void;
};

type JuiVirtualizedSelectProps = JuiVirtualizedSelectInputProps & {
  input?: JSX.Element;
};

const defaultInput = <Input />;

const useSingleSelectHelper = <T extends any>(value?: T) => {
  const [selected = value, setSelected] = useState<T | undefined>();
  return { selected, setSelected };
};

const JuiVirtualizedSelectInput = React.memo(
  (props: JuiVirtualizedSelectInputProps) => {
    const { name, value, onChange, renderValue, automationId, ...rest } = props;
    const elementChildren = filterReactElement<JuiMenuItemProps>(
      props.children,
    );
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
      onChange && onChange(event, child);
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
      if (!popupHelper.SelectMenuProps.open && displayRef.current) {
        displayRef.current.focus();
      }
    }, [popupHelper.SelectMenuProps.open]);

    useLayoutEffect(() => {
      if (displayRef.current) {
        setMinWidth(displayRef.current.clientWidth);
      }
    }, [displayRef.current]);

    return (
      <>
        <StyledInput
          ref={displayRef as any}
          {...popupHelper.SelectTriggerProps}
          {...rest}
        >
          {renderValue ? renderValue(value) : value}
        </StyledInput>
        <JuiVirtualizedMenu
          {...popupHelper.SelectMenuProps}
          {...rest.MenuProps}
          initialFocusedIndex={Math.max(selectedIndex, 0)}
        >
          {children}
        </JuiVirtualizedMenu>
        <ArrowDropDownIcon />
      </>
    );
  },
);

const JuiVirtualizedSelect = (props: JuiVirtualizedSelectProps) => {
  const { input = defaultInput, heightSize, automationId, ...rest } = props;
  return React.cloneElement(input, {
    heightSize,
    inputComponent: JuiVirtualizedSelectInput,
    'data-test-automation-id': automationId,
    select: true,
    inputProps: {
      type: undefined, // We render a select. We can ignore the type provided by the `Input`.
      ...rest,
    },
  });
};

export { JuiVirtualizedSelect, JuiVirtualizedSelectProps };
