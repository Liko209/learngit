/*
 * @Author: Paynter Chen
 * @Date: 2019-07-25 16:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import {
  readApiJson,
  ItContext,
  get,
  IApiContract,
  IRequestResponse,
} from 'shield/sdk';
import { IGlipPostPost } from 'shield/sdk/mocks/glip/api/post/post.post.contract';
import { GlipInitialDataHelper } from 'shield/sdk/mocks/glip/data/data';
import { GlipGroup, GlipPost, GlipBase } from 'shield/sdk/mocks/glip/types';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';
import { UpdateSpec, update } from 'foundation/utils/update';
import { IGlipTeamPost } from 'shield/sdk/mocks/glip/api/team/team.post.contract';

export abstract class CreateEntitySuccess<
  T extends GlipBase
> extends GlipScenario {
  entity: T;
  protected abstract getApiJson(): IRequestResponse;
  constructor(
    protected context: ItContext,
    protected glipIndexDataHelper: GlipInitialDataHelper,
    public props: {
      entity?: UpdateSpec<T>;
    },
  ) {
    super(context, glipIndexDataHelper, props);
    const { helper } = context;

    const templateJson = readApiJson<IApiContract>(this.getApiJson());
    const modifiedJson = update(templateJson, {
      response: {
        data: get(props, v => v.entity),
      },
    });
    this.entity = helper.mockResponse(modifiedJson, api => api.response.data);
  }
}
