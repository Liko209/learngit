import React from 'react';
import { shallow } from 'enzyme';
import { Notification } from '@/containers/Notification';
import { MenuViewComponent } from '../Menu.View';
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
        closeConversation: () => {
          throw new Error('Failed to close conversation');
        },
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
            message: 'people.prompt.SorryWeWereNotAbleToCloseTheConversation',
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
        toggleFavorite: () => {
          throw new Error('Failed to favorite conversation');
        },
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markFavoriteServerErrorContent',
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
        toggleFavorite: () => {
          throw new Error('Failed to unFavorite conversation');
        },
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markUnFavoriteServerErrorContent',
            type: ToastType.ERROR,
          }),
        );
        done();
      },         0);
    }, 2);
  });
});
