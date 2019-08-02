import { IApiContract, IApiPath } from '../types';

export const defineApiPath = <A extends IApiContract>(
  t: IApiPath<A>,
): IApiPath<A> => t;
