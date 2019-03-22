/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 14:59:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'test-util/electron';
import { Hello } from './Hello';

describe('Electron Runner', () => {
  it('should render React Class Component', () => {
    const { instance, htmlElement } = mount(
      <Hello message="Class Component" />,
    );
    expect(instance.props.message).toBe('Class Component');
    expect(htmlElement.innerText).toBe('Hello Class Component');
    expect(htmlElement.offsetHeight).toBe(20);
  });

  it('should be able to render React SFC Component', () => {
    const { instance, htmlElement } = mount(
      <Hello message="Functional Component" />,
    );
    expect(instance.props.message).toBe('Functional Component');
    expect(htmlElement.innerText).toBe('Hello Functional Component');
    expect(htmlElement.offsetHeight).toBe(20);
  });
});
