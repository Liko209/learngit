/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:47:58
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement, ComponentType } from 'react';
import { mount, EnzymePropSelector, ReactWrapper } from 'enzyme';
import { IWrapper } from './interface';
import ReactQuill, { Quill } from 'react-quill';
import { needWait } from './utils';


class EnzymeWrapper implements IWrapper<ReactWrapper> {
  protected wrapper: ReactWrapper;

  constructor(wrapper: ReactWrapper) {
    this.init(wrapper);
  }

  init(origin: any) {
    this.wrapper = origin;
  }

  findByAutomationID(id: string, first: boolean = true) {
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

  findByProps(props: EnzymePropSelector): IWrapper<ReactWrapper> {
    const result = this.wrapper.find(props);
    return new EnzymeWrapper(result);
  }

  findWhere(predicate: (wrapper: ReactWrapper) => boolean) {
    const result = this.wrapper.findWhere(predicate);
    return [new EnzymeWrapper(result)];
  }

  @needWait
  click() {
    this.wrapper.simulate('click');
  }

  @needWait
  enter() {
    const quill = this.wrapper.find(ReactQuill);
    if (quill) {
      const editor: Quill = (quill.instance() as any).getEditor();
      const text = editor.getText();
      // @ts-ignore
      const bindings = editor.keyboard.bindings['13'];
      const range = { index: text.length, length: 0 };
      const context = {
        collapsed: true,
        empty: false,
        format: {},
        offset: text.length,
      };
      const args = [range, context];
      bindings.forEach(({ handler }: { handler: Function }) => {
        Reflect.apply(handler, editor.keyboard, args);
      });
    } else {
      this.wrapper.simulate('keyDown', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
      });
    }
  }

  @needWait
  input(text: string) {
    const quill = this.wrapper.find(ReactQuill);
    if (quill) {
      const editor: Quill = (quill.instance() as any).getEditor();
      editor.focus();
      editor.setText(text);
      editor.update();
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
