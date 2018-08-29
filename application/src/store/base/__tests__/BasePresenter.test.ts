/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-07 08:52:35
 * Copyright © RingCentral. All rights reserved.
 */
import BasePresenter from '../BasePresenter';
import storeManager from '../../../store';

const presenter = new BasePresenter();

describe('BasePresenter', () => {
  beforeEach(() => { });

  describe('updateEntityStore', () => {
    it('storeManager should call dispatchUpdatedDataModels', () => {
      jest.spyOn(storeManager, 'dispatchUpdatedDataModels');
      presenter.updateEntityStore('group', [{ id: 222 }]);
      expect(storeManager.dispatchUpdatedDataModels).toHaveBeenCalledWith(
        'group',
        [{ id: 222 }],
      );
    });

    it('storeManager should not call dispatchUpdatedDataModels', () => {
      jest.spyOn(storeManager, 'dispatchUpdatedDataModels');
      presenter.updateEntityStore('group', []);
      expect(storeManager.dispatchUpdatedDataModels).not.toHaveBeenCalledWith(
        'group',
        [],
      );
    });
  });

  describe('dispose()', () => {
    it('super dispose should be called', () => {
      jest.spyOn(BasePresenter.prototype, 'dispose');
      presenter.dispose();
      expect(BasePresenter.prototype.dispose).toHaveBeenCalledTimes(1);
    });
  });
});
