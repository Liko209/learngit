/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:47:58
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement, ComponentType } from 'react';
import { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import { IWrapper } from './interface';
import ReactQuill from 'react-quill';
import { Simulate } from 'react-dom/test-utils';

class EnzymeWrapper implements IWrapper<ReactWrapper> {
  protected wrapper: ReactWrapper;

  constructor(wrapper: ReactWrapper) {
    this.init(wrapper);
  }

  init(origin: any) {
    this.wrapper = origin;
  }

  findByAutomationID(id: string, first: boolean = false) {
    const result = this.wrapper.find({ 'data-test-automation-id': id });
    if (first) {
      return new EnzymeWrapper(result.first());
    }
    return new EnzymeWrapper(result);
  }

  find(component: ComponentType) {
    const result = this.wrapper.find(component);
    return [new EnzymeWrapper(result)];
  }

  click() {
    this.wrapper.simulate('click');
  }

  enter() {
    this.wrapper.simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13 });
  }

  input(text: string) {
    const quill = this.wrapper.find(ReactQuill);
    if (quill) {
      const editor = (quill.instance() as any).getEditor();
      editor.focus();
      editor.setText(text);
      editor.update();
      console.warn(7777777, editor.getText());
      editor.focus();
      const divs = quill.find('div');
      Simulate.keyDown(quill.getDOMNode(), {
        key: 'Enter',
        keyCode: 13,
        which: 13,
      });
      Simulate.keyDown(this.wrapper.getDOMNode(), {
        key: 'Enter',
        keyCode: 13,
        which: 13,
      });
      Simulate.keyDown(divs.first().getDOMNode(), {
        key: 'Enter',
        keyCode: 13,
        which: 13,
      });
      // divs.first().props().onKeyDown!({
      //   key: 'Enter',
      //   keyCode: 13,
      //   which: 13,
      // } as any);
      // divs.forEach(w => {
      //   console.warn(888888, w.debug());
      //   w.simulate('keydown', );
      // });
      // quill.simulate('keydown', { key: 'Enter', keyCode: 13, which: 13 });
      // this.enter();
    } else {
      this.wrapper.simulate('change', { target: { value: text } });
    }
  }

  flush() {
    this.wrapper.update();
  }

  toString() {
    return this.wrapper.debug();
  }
}

function enzymeCreator(element: ReactElement): IWrapper<ReactWrapper> {
  return new EnzymeWrapper(mount(element));
}

export { EnzymeWrapper, enzymeCreator };
