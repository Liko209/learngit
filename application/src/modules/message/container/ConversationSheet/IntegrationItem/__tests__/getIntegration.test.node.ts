import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { GlipTypeUtil } from 'sdk/utils';
import { getIntegration } from '../getIntegration';
import PostModel from '@/store/models/Post';
import * as utils from '@/utils/i18nT';
import { ServiceLoader } from 'sdk/module/serviceLoader';

describe('getIntegration', () => {
  @testable
  class integration {
    beforeEach() {
      jest.spyOn(GlipTypeUtil, 'isIntegrationType').mockReturnValue(true);
      jest.spyOn(utils, 'i18nP').mockReturnValue('18');
    }

    @test('should return activity when there is only one integration item')
    @mockEntity({ activity: 'integration' })
    @mockService({ activity: 'integration' })
    t1() {
      const post = { itemIds: [1] } as PostModel;
      expect(getIntegration(post, 'name', false)).toBe('integration');
    }

    @test('should return activity when there is two integration items')
    @mockEntity({ activity: 'integration' })
    @mockService({ activity: 'integration' })
    t2() {
      const post = { itemIds: [1, 2] } as PostModel;
      expect(getIntegration(post, 'name', false)).toBe('18');
    }

    @test('should return null when there is no integration items')
    @mockEntity({ activity: 'integration' })
    @mockService({ activity: 'integration' })
    t3() {
      const post = {} as PostModel;
      expect(getIntegration(post, 'name', false)).toBeUndefined();
    }

    @test('should use service if byservice is true')
    @mockEntity({ activity: 'integration' })
    @mockService({ activity: 'integration' })
    t4() {
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        getById: async () => ({ activity: 'integration' }),
      });
      const post = { itemIds: [1] } as PostModel;
      expect(getIntegration(post, 'name', true)).resolves.toBe('integration');
    }
  }
});
