import PostModel from '@/store/models/Post';
import { GlipTypeUtil } from 'sdk/utils';
import { getEntity } from '@/store/utils';
import { IntegrationItem } from 'sdk/module/item/entity';
import IntegrationItemModel from '@/store/models/IntegrationItem';
import { ENTITY_NAME } from '@/store';
import { i18nP } from '@/utils/i18nT';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ItemService } from 'sdk/module/item';

function getIntegration(
  post: PostModel,
  userName: string,
  byService?: boolean,
) {
  if (post.itemIds) {
    const integrationItems = post.itemIds.filter(
      GlipTypeUtil.isIntegrationType,
    );
    if (integrationItems.length > 0) {
      if (post.itemIds.length === 1) {
        const integrationItemID = integrationItems[0];
        if (byService) {
          return ServiceLoader.getInstance<ItemService>(
            ServiceConfig.ITEM_SERVICE,
          )
            .getById(integrationItemID)
            .then((i: IntegrationItem) => i && i.activity);
        }
        const item = getEntity<IntegrationItem, IntegrationItemModel>(
          ENTITY_NAME.ITEM,
          integrationItemID,
        );
        return item.activity;
      }
      return i18nP('message.sharedItems', { userName });
    }
  }
  return;
}

export { getIntegration };
