import React, { useCallback, useMemo } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiIconography } from 'jui/foundation/Iconography';
import FileItemModel from '@/store/models/FileItem';
import { getLargeRawImageURL } from '@/common/getThumbnailURL';
import { Translation } from 'react-i18next';
import { isElectron } from '@/common/isUserAgent';
import { Scene, trackViewInBrowserAction } from '../dataTrackings';
import externalLinkSymbol from 'jui/assets/jupiter-icon/icon-external_link.svg';

type ViewInBrowserTabActionProps = {
  item: FileItemModel;
  scene: Scene;
};

function ViewInBrowserTabAction({ item, scene }: ViewInBrowserTabActionProps) {
  const handleClick = useCallback(async () => {
    trackViewInBrowserAction(scene, item.name);
    const url = await getLargeRawImageURL(item);
    window.open(url);
  }, [item]);

  const icon = useMemo(
    () => (
      <JuiIconography
        symbol={externalLinkSymbol}
        iconColor={['grey', '500']}
        iconSize="small"
      />
    ),
    [],
  );

  return (
    <JuiMenuItem
      icon={icon}
      data-test-automation-id={'viewInBrowserTab'}
      onClick={handleClick}
    >
      <Translation ns="translations">
        {t =>
          t(
            isElectron
              ? 'message.fileAction.viewInBrowser'
              : 'message.fileAction.viewInNewTab',
          )
        }
      </Translation>
    </JuiMenuItem>
  );
}

export { ViewInBrowserTabAction, ViewInBrowserTabActionProps };
