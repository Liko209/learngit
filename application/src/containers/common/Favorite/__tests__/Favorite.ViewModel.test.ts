/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { getEntity } from '../../../../store/utils';
import { FavoriteViewModel } from '../Favorite.ViewModel';
import { FavoriteProps } from '../types';

jest.mock('../../../../store/utils');

const mockGroup = {
  id: 123,
};

const { GroupService } = service;
const groupService = {
  getLocalGroup: jest.fn().mockResolvedValue(mockGroup),
  markGroupAsFavorite: jest.fn().mockResolvedValue(ServiceCommonErrorType.NONE),
};
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const mockEntity = {
  isFavorite: true,
};
const props: FavoriteProps = {
  id: 1,
  isAction: false,
  hideUnFavorite: false,
  size: 'medium',
};
const vm = new FavoriteViewModel(props);

describe('Favorite view model', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockEntity);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed isAction', () => {
    vm.props.isAction = true;
    expect(vm.isAction).toEqual(true);
    vm.props.isAction = false;
    expect(vm.isAction).toEqual(false);
  });

  it('computed hideUnFavorite', () => {
    vm.props.hideUnFavorite = true;
    expect(vm.hideUnFavorite).toEqual(true);
    vm.props.hideUnFavorite = false;
    expect(vm.hideUnFavorite).toEqual(false);
  });

  it('computed size', () => {
    vm.props.size = 'small';
    expect(vm.size).toEqual('small');
    vm.props.size = 'medium';
    expect(vm.size).toEqual('medium');
    vm.props.size = 'large';
    expect(vm.size).toEqual('large');
  });

  it('computed variant', () => {
    vm.props.isAction = true;
    expect(vm.variant).toEqual('round');
    vm.props.isAction = false;
    expect(vm.variant).toEqual('plain');
  });

  it('computed conversationId by person id', async () => {
    vm.props.id = 2514947;
    await vm.getFavorite();
    expect(vm.conversationId).toEqual(mockGroup.id);
  });

  it('computed conversationId by team or group id', async () => {
    vm.props.id = 11370502;
    await vm.getFavorite();
    expect(vm.conversationId).toEqual(11370502);
  });

  it('computed isFavorite', () => {
    mockEntity.isFavorite = true;
    expect(vm.isFavorite).toEqual(true);
    mockEntity.isFavorite = false;
    expect(vm.isFavorite).toEqual(false);
  });

  it('request service for handler favorite', async () => {
    const result = await vm.handlerFavorite();
    expect(result).toEqual(ServiceCommonErrorType.NONE);
  });
});
