/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */

enum MENU_LIST_ITEM_TYPE {
  QUOTE,
  DELETE,
  EDIT,
}

type Props = {
  id: number;
};

type ViewProps = {
  id: number;
  permissionsMap: {
    [key: string]: { permission: boolean; shouldShowAction?: boolean };
  };
  showMoreAction: boolean;
};

export { Props, ViewProps, MENU_LIST_ITEM_TYPE };
