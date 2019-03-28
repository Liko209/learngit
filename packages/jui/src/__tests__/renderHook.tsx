/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 12:19:59
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
type HookRef<T> = { current: T };
type TestHookProps<T> = {
  children: () => void;
};

const TestHook = <T extends {}>({ children }: TestHookProps<T>) => {
  children();
  return null;
};

const renderHook = <T extends {}>(useHook: () => T) => {
  const hookRef: HookRef<T> = {} as HookRef<T>;

  mount(
    <TestHook>
      {() => {
        hookRef.current = useHook();
      }}
    </TestHook>,
  );

  return hookRef;
};

export { renderHook };
