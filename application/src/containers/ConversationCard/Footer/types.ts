/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
import { WithPostLikeComponentProps } from './withPostLike/types';
import { WithNamespaces } from 'react-i18next';

type FooterViewModelProps = WithPostLikeComponentProps & WithNamespaces;

type FooterViewProps = {
  iLiked: boolean;
  likedUsersCount: number;
  likedUsersNameMessage: string;
  onToggleLike(): Promise<void> | void;
};

export { FooterViewModelProps, FooterViewProps };
