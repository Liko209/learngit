/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 14:40:46
 * Copyright © RingCentral. All rights reserved.
 */
export type User = {
  id: number;
  companyId: number;
  email: string;
  username: string;
};

export interface IErrorReporter {
  report: (error: Error) => void;
  setUser: (user: User) => void;
}
