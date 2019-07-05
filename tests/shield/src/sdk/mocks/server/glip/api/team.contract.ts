/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 10:57:02
 * Copyright © RingCentral. All rights reserved.
 */
import { IApi } from '../../../../types';
import { Route } from '../../../../decorators/Route.decorator';
// interface IApiContract<T extends IApi> {
//   api: T;
//   desc: IRoute<T>;
// }

// interface IApi {
//   path: string;
//   method: string;
//   query: object;
//   request: object;
//   response: object;
// }

// interface IRouterHandler<T extends IApi> {
//   (param: T): void;
// }

// type IRoute<T extends IApi> = Omit<
//   T,
//   'query' | 'request' | 'response'
// > & { query: QueryParser<T['query']> };

export interface IApiTeamPost extends IApi {
  path: '/api/team/:id';
  method: 'post';
  query: {
    id: number;
  };
}

// const String2Number = (v: string): number => {
//   return Number(v);
// };
// const createTeam: IRoute<IApiTeamPost> = {
//   path: '/api/team/:id',
//   method: 'post',
//   query: {
//     id: String2Number,
//   },
// };

// class GlipController {
//   @Route<IApiTeamPost>({
//     path: '/api/team/:id',
//     method: 'post',
//     query: {
//       id: String2Number,
//     },
//   })
//   createTeam() {}
// }

// interface IRouter {
//   register: <T extends IApi>(
//     info: T & { query: QueryParser<T['query']> },
//   ) => void;

//   dispatch: () => void;
// }

// const Route = <T extends IApi>(desc: IRoute<T>): MethodDecorator => {
//   return (target, propertyKey, descriptor) => {
//     Reflect.defineMetadata('META_ROUTE', desc, target, propertyKey);
//     return descriptor;
//   };
// };

// const Controller = <T extends IApi>(desc: IRoute<T>): ClassDecorator => {
//   return (target) => {
//     Reflect.defineMetadata('META_CONTROLLER', target);
//   };
// };

// class MyController {

//   @Route({
//     path: '/api/team/:id',
//     method: 'post',
//     query: {
//       id: String2Number,
//     },
//   })
//   createPost() {

//   }
// }

// const createApi = <T extends IApiContract>(
//   option: T & {query: QueryParser<T['query']>},
// ): T => {
//   const query: T['query'] = {};
//   Object.keys(option.query).forEach(key => {
//     query[key] = option.query[key];
//   });
//   return {
//     path: apiDesc.path,
//     method: apiDesc.method,
//     query: {},
//   };
// };
// interface IRegisterApi {
//   ()
// }

// interface IApiTeamPost extends IApi {
//   path: '/api/team/:id';
//   method: 'post';
//   query: {
//     id: string;
//   };
//   // request: IRequest;
// }

// interface IApiDesc<Q> {
//   path: string;
//   method: string;
//   query: QueryParser<Q>;
// }

// const String2Number = (v: string): number => {
//   return Number(v);
// };

// const createApi = <Q extends object, T extends IApiDesc<Q>>(
//   apiDesc: T,
// ): IApi<Q> => {
//   const query: IApi<Q> = {};
//   Object.keys(apiDesc.query).forEach(key => {
//     query[key] = apiDesc[query];
//   });
//   return {
//     path: apiDesc.path,
//     method: apiDesc.method,
//     query: {},
//   };
// };

// const teamPost = createApi({
//   path: '/api/team/:id',
//   method: 'post',
//   query: {
//     id: String2Number,
//   },
// });

// type AP<T extends IApi> = {
//   request: T['request'];
// };

// // interface IApiRouter<T extends IApi> {
// //   (param: AP<T>): void;
// // }

// const aa: IApiTeamPost = {
//   path: '/api/team/:id',
//   method: 'post',
//   query: {
//     id: 'number',
//   },
// };
