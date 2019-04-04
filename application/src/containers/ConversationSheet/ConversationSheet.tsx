/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-26 19:50:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type RegisterOptions = {
  priority: number;
  component: React.ComponentType<{
    ids: number[];
  }>;
  type: any;
  breakIn: boolean;
};

type PayLoad = {
  type: any;
  props: {
    postId: number;
    mode?: string;
    ids: number[];
  };
};

class ConversationSheet {
  private _middleware: Function[] = [];
  private _defaultHandler = () => () => null;

  dispatch: Function;

  constructor() {
    const requireContext = require.context('./', true, /register.tsx?$/);
    const keys = requireContext.keys();
    const modules = keys
      .map(requireContext)
      .map((module: { default: RegisterOptions }) => module.default)
      .sort((a, b) => b.priority - a.priority);
    modules.forEach((module: RegisterOptions) => {
      this._register(module);
    });

    const chain = this._compose(this._middleware)(this._defaultHandler);

    this.dispatch = (
      sheets: { [type: string]: number[] },
      postId: number,
      mode?: string,
    ) => {
      if (!Object.keys(sheets).length) {
        return null;
      }
      const renderSheets: any[] = [];
      modules.every((module: RegisterOptions) => {
        const { type, breakIn } = module;
        if (!sheets[type]) {
          return true;
        }
        renderSheets.push(
          chain({
            type,
            props: {
              postId,
              mode,
              ids: sheets[type],
            },
          }),
        );
        return !breakIn;
      });
      return renderSheets;
    };
  }

  private _register(options: RegisterOptions) {
    const { component: Component, type } = options;
    const middleware = (next: Function) => (payload: PayLoad) => {
      if (payload.type === type) {
        return <Component key={type} {...payload.props} />;
      }

      return next(payload);
    };
    this._middleware.push(middleware);
  }

  private _compose(funcs: Function[]) {
    if (funcs.length === 0) {
      return (arg: any) => arg;
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
  }
}

const conversationSheet = new ConversationSheet();

export { conversationSheet };
