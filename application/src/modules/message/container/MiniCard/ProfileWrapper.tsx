/*
 * @Author: Spike.Yang
 * @Date: 2019-06-25 13:28:19
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useEffect, useRef, SFC, memo } from 'react';
import portalManager from '@/common/PortalManager';

type ProfileWrapperProps = {
  dismiss: () => void;
  cardContent: React.ReactNode;
};

const ProfileWrapper: SFC<ProfileWrapperProps> = memo(
  ({ dismiss, cardContent }: ProfileWrapperProps) => {
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

    return <div ref={_ref}>{cardContent}</div>;
  },
);

export { ProfileWrapper };
