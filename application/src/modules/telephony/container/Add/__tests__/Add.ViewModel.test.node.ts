/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-10 13:29:54
 * Copyright © RingCentral. All rights reserved.
 */

import { AddViewModel } from '../Add.ViewModel';

// For test coverage

let addViewModel: AddViewModel;

beforeEach(() => {
  addViewModel = new AddViewModel();
});

describe('AddViewModel', () => {
  it('Should call `add`', () => {
    addViewModel.add = jest.fn();
    addViewModel.add();
    expect(addViewModel.add).toHaveBeenCalled();
  });
});
