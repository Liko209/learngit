/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 12:19:55
 * Copyright © RingCentral. All rights reserved
 *
 * An official way to wrap styled-components in typescript.
 * See: https://www.styled-components.com/docs/api#typescript
 */
// Fix error TS4023: Exported variable 'ThemeProvider' has or is using name 'React.ComponentClass'
// from external module "Fiji/node_modules/@types/react/index" but cannot be named.
// See: https://github.com/styled-components/styled-components/issues/1847
import { ComponentClass } from 'react';

import * as styledComponents from 'styled-components';
import { Theme } from './theme/theme';

declare module 'styled-components' {
  // tslint:disable-next-line
  export interface ThemedStyledComponentsModule<T> {
    createGlobalStyle(
      strings: TemplateStringsArray,
      ...interpolations: styledComponents.SimpleInterpolation[]
    ): React.ComponentClass;
  }

  export function createGlobalStyle(
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.SimpleInterpolation[]
  ): React.ComponentClass;
}
// Helper type operators
type KeyofBase = keyof any;
type Diff<T extends KeyofBase, U extends KeyofBase> = ({ [P in T]: P } &
  { [P in U]: never })[T];
type DiffBetween<T, U> = Pick<T, Diff<keyof T, keyof U>> &
  Pick<U, Diff<keyof U, keyof T>>;
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
type WithOptionalTheme<P extends { theme?: T }, T> = Omit<P, 'theme'> & {
  theme?: T;
};

type Attrs<P, A extends Partial<P>, T> = {
  [K in keyof A]:
    | ((props: styledComponents.ThemedStyledProps<P, T>) => A[K])
    | A[K]
};

type ThemedStyledComponentFactories<T> = {
  [TTag in keyof JSX.IntrinsicElements]: styledComponents.ThemedStyledFunction<
    JSX.IntrinsicElements[TTag],
    T
  >
};

type Dependencies = {
  dependencies?: (React.ComponentType | ((props: any) => JSX.Element))[];
};

type ThemedStyledFunction<P, T, O = P> = {
  (
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.Interpolation<
      styledComponents.ThemedStyledProps<P, T>
    >[] // tslint:disable-line
  ): styledComponents.StyledComponentClass<P, T, O> & Dependencies;
  <U>(
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.Interpolation<
      styledComponents.ThemedStyledProps<P & U, T>
    >[] // tslint:disable-line
  ): styledComponents.StyledComponentClass<P & U, T, O & U> & Dependencies;
  attrs<U, A extends Partial<P & U> = {}>(
    attrs: Attrs<P & U, A, T>,
  ): ThemedStyledFunction<DiffBetween<A, P & U>, T, DiffBetween<A, O & U>>;
};

type ThemedBaseStyledInterface<T> = ThemedStyledComponentFactories<T> & {
  <P, TTag extends keyof JSX.IntrinsicElements>(
    tag: TTag,
  ): ThemedStyledFunction<P, T, P & JSX.IntrinsicElements[TTag]>;
  <P, O>(
    component: styledComponents.StyledComponentClass<P, T, O>,
  ): ThemedStyledFunction<P, T, O>;
  <P extends { [prop: string]: any; theme?: T }>(
    component: React.ComponentType<P>,
  ): ThemedStyledFunction<P, T, WithOptionalTheme<P, T>>;
};

type ThemedStyledComponentsModule<T> = {
  default: ThemedBaseStyledInterface<T>;
  css: styledComponents.ThemedCssFunction<T>;
  keyframes(
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.SimpleInterpolation[] // tslint:disable-line
  ): string;
  injectGlobal(
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.SimpleInterpolation[] // tslint:disable-line
  ): void;
  createGlobalStyle(
    strings: TemplateStringsArray,
    ...interpolations: styledComponents.SimpleInterpolation[]
  ): React.ComponentClass;
  withTheme<P extends { theme?: T }>(
    component: React.ComponentType<P>,
  ): ComponentClass<WithOptionalTheme<P, T>>;

  ThemeProvider: styledComponents.ThemeProviderComponent<T>;
};

const {
  default: styled,
  css,
  createGlobalStyle,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as ThemedStyledComponentsModule<Theme>;

export {
  css,
  createGlobalStyle,
  injectGlobal,
  keyframes,
  ThemeProvider,
  ThemedStyledFunction,
  ThemedBaseStyledInterface,
  ThemedStyledComponentsModule,
  Dependencies,
  WithOptionalTheme,
};
export default styled;
