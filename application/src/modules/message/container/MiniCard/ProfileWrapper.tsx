/*
 * @Author: Spike.Yang
 * @Date: 2019-06-25 13:28:19
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useEffect, useRef, SFC, memo } from 'react';
import portalManager from '@/common/PortalManager';
import { Profile, PROFILE_TYPE } from '../Profile';

type ProfileWrapperProps = {
  id: number;
  dismiss: () => void;
};

/* eslint-disable */
const ProfileWrapper: SFC<ProfileWrapperProps> = memo(({ id, dismiss }) => {
  const _ref = useRef<HTMLDivElement>(null);

  const _clickEventHandler = (event: MouseEvent) => {
    if (!_ref.current || !event.target) {
      return;
    }

    const isClickOutSide =
      !_ref.current.contains(event.target as HTMLElement) &&
      _ref.current !== event.target;

    if (isClickOutSide || portalManager.profilePortalShouldClose) {
      dismiss();
    }
  };

  useEffect(() => {
    document.addEventListener('click', _clickEventHandler);
    return () => {
      document.removeEventListener('click', _clickEventHandler);
    };
  }, []);

  return (
    <div ref={_ref}>
      <Profile id={id} type={PROFILE_TYPE.MINI_CARD} />
    </div>
  );
});

export { ProfileWrapper };
