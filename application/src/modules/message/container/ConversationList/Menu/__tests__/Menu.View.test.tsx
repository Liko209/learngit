import React from 'react';
import { shallow } from 'enzyme';
import { Notification } from '@/containers/Notification';
import { MenuViewComponent } from '../Menu.View';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import {
  ERROR_CODES_SDK,
  JSdkError,
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';

jest.mock('@/common/genDivAndDismiss');
jest.mock('@/containers/Notification');

Notification.flashToast = jest.fn();

function setUpMock(
  boolVal: boolean,
  isFailed: boolean,
  errorType: 'network' | 'server',
) {
  return {
    isFavorite: boolVal,
    isUnread: boolVal,
    onClose: () => {},
    groupId: 1234,
    anchorEl: null,
    showClose: true,
    disabledReadOrUnread: false,
    favoriteText: 'favoriteText',
    shouldSkipCloseConfirmation: true,
    closable: false,
    toggleRead: jest.fn(),
    closeConversation: jest.fn().mockImplementationOnce(() => {
      if (!isFailed) {
        return;
      }
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
    toggleFavorite: jest.fn().mockImplementationOnce(() => {
      if (!isFailed) {
        return;
      }
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
}

describe('MenuView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render()', () => {
    it('should display flash toast notification when close conversation failed for backend issue. [JPT-490]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="closeConversation"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToCloseTheConversationForServerIssue',
        }),
      );
      done();
    });

    it('should display flash toast notification when close conversation failed for network issue. [JPT-490]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="closeConversation"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToCloseTheConversationForNetworkIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when unfavorite conversation failed for backend issue.[JPT-489]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToUnFavoriteForServerIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when favorite conversation failed for backend issue.[JPT-488]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'server');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToFavoriteThisMessageForServerIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when unfavorite conversation failed for network issue.[JPT-489]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToUnFavoriteForNetworkIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when favorite conversation failed for network issue.[JPT-488]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'network');
      const wrapper = shallow(<MenuViewComponent {...props} />);

      await wrapper
        .find('[data-test-automation-id="favToggler"]')
        .simulate('click', { stopPropagation: () => undefined });

      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToFavoriteThisMessageForNetworkIssue',
        }),
      );
      done();
    });

    it('should display flash toast notification when read conversation failed [JPT-1272]', (done: jest.DoneCallback) => {
      const props: any = {
        isUnread: true,
        onClose: () => {},
        toggleRead: () => {
          throw new JSdkError(
            ERROR_CODES_SDK.GENERAL,
            'Failed to read conversation',
          );
        },
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="readOrUnreadConversation"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markAsRead',
            type: ToastType.ERROR,
          }),
        );
        done();
      }, 0);
    }, 2);

    it('should display flash toast notification when unread conversation failed [JPT-1272]', (done: jest.DoneCallback) => {
      const props: any = {
        isUnread: false,
        onClose: () => {},
        toggleRead: () => {
          throw new JSdkError(
            ERROR_CODES_SDK.GENERAL,
            'Failed to unread conversation',
          );
        },
      };

      const wrapper = shallow(<MenuViewComponent {...props} />);

      wrapper
        .find('[data-test-automation-id="readOrUnreadConversation"]')
        .simulate('click', { stopPropagation: () => undefined });

      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markAsUnread',
            type: ToastType.ERROR,
          }),
        );
        done();
      }, 0);
    }, 2);
  });
});
