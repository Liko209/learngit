import React from 'react';
import { shallow } from 'enzyme';
import { serviceErr } from 'sdk/service/ServiceResult';
import { Notification } from '@/containers/Notification';
import { MenuViewComponent } from '../Menu.View';
import { ERROR_CODES_SDK } from 'sdk/error';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';

jest.mock('@/common/genDivAndDismiss');
jest.mock('@/containers/Notification');

Notification.flashToast = jest.fn();

describe('MenuView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render()', () => {
    it('should display flash toast notification when close conversation failed [JPT-490]', (done: jest.DoneCallback) => {
      const props: any = {
        groupId: 1,
        showClose: true,
        closeConversation: () =>
          serviceErr(ERROR_CODES_SDK.GENERAL, 'Failed to close conversation'),
        shouldSkipCloseConfirmation: true,
        onClose: () => {},
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="closeConversation"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'SorryWeWereNotAbleToCloseTheConversation',
            type: ToastType.ERROR,
          }),
        );
        done();
      },         0);
    }, 2);

    it('should display flash toast notification when favorite conversation failed [JPT-488]', (done: jest.DoneCallback) => {
      const props: any = {
        isFavorite: false,
        onClose: () => {},
        toggleFavorite: () =>
          serviceErr(ERROR_CODES_SDK.GENERAL, 'Failed to favorite conversation'),
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'markFavoriteServerErrorContent',
            type: ToastType.ERROR,
          }),
        );
        done();
      },         0);
    }, 2);

    it('should display flash toast notification when unFavorite conversation failed [JPT-489]', (done: jest.DoneCallback) => {
      const props: any = {
        isFavorite: true,
        onClose: () => {},
        toggleFavorite: () =>
          serviceErr(
            ERROR_CODES_SDK.GENERAL,
            'Failed to unFavorite conversation',
          ),
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'markUnFavoriteServerErrorContent',
            type: ToastType.ERROR,
          }),
        );
        done();
      },         0);
    }, 2);
  });
});
