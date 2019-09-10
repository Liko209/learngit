/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-08-05 10:03:52
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { readApiJson } from 'shield/sdk';
import { jit } from 'shield/sdk/SdkItFramework';
import { PersonService } from 'sdk/module/person';
import { IGlipPersonPut } from 'shield/sdk/mocks/glip/api/person/person.put.contract';

jit('edit personal info', ({ helper, sdk, userContext, template }) => {
  let personService: PersonService;
  const glipData = helper.useInitialData(template.BASIC);

  beforeAll(async () => {
    const personData = require('./data/PERSON_DATA.json');
    glipData.people = [personData];

    await sdk.setup('glip');

    personService = ServiceLoader.getInstance(ServiceConfig.PERSON_SERVICE);
  });

  describe('edit profile', () => {
    const file = new File(
      ['111'] as BlobPart[],
      'star-wars-wallpaper-3--.jpg',
      {
        lastModified: Date.now(),
        type: 'jpg',
      },
    );

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      jest.restoreAllMocks();
    });

    it('should get new person data when edit profile data without avatar', async () => {
      const updateData = {
        first_name: 'f_n',
        last_name: 'l_n',
        homepage: 'h.com',
        job_title: 'jpt engineer',
        location: 'xmn',
      };
      helper.mockResponse(
        readApiJson<any>(require('./data/EDIT_PROFILE.SUCCESS.json')),
        data => {
          return data;
        },
      );

      const id = userContext.glipUserId();
      await personService.editPersonalInfo(updateData);
      const person = (await personService.getById(id))!;
      expect(person).toEqual(expect.objectContaining(updateData));
    });

    it('should get new person data when edit profile together with avatar', async () => {
      const updateData = {
        first_name: 'f_n',
        last_name: 'l_n',
      };
      const headShot = {
        stored_file_id: 12075020,
        creator_id: 2113539,
        url:
          'https://glipasialabnet-glpdevxmn.s3.amazonaws.com/web/customer_files/12075020/star-wars-wallpaper-3--.jpg?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=bm3%2BXME0%2BkzJ5kWahsqUP3TKCkk%3D',
        offset: '560x0',
        crop: '1440x1440',
      };

      helper.mockResponse(
        readApiJson<any>(require('./data/EDIT_PROFILE.SUCCESS.json')),
        data => {
          data.response.data = {
            ...data.response.data,
            ...updateData,
            headshot: { ...headShot },
            headshot_version: 6874757200871424,
          };
          return data;
        },
      );

      helper.mockResponse(
        readApiJson<any>(require('./data/CREATE_FILE_DATA.SUCCESS.json')),
        data => {
          return data;
        },
      );

      helper.mockResponse(
        readApiJson<any>(require('./data/UPLOAD_FILE.SUCCESS.json')),
        data => {
          return data;
        },
      );

      const id = userContext.glipUserId();
      await personService.editPersonalInfo(updateData, {
        file,
        offset: '560x0',
        crop: '1440x1440',
      });

      const person = (await personService.getById(id))!;
      expect(person).toEqual(
        expect.objectContaining({ ...updateData, headshot: { ...headShot } }),
      );
    });

    function preSetApi(data: {
      personSuccess: boolean;
      createFileSuccess: boolean;
      uploadFileSuccess: boolean;
    }) {
      const errorMessage = {
        status: 500,
      };
      if (data.personSuccess) {
        helper.mockResponse(
          readApiJson<any>(require('./data/EDIT_PROFILE.SUCCESS.json')),
          data => {
            return data;
          },
        );
      } else {
        helper.mockApi(IGlipPersonPut, errorMessage);
      }

      if (data.createFileSuccess) {
        helper.mockResponse(
          readApiJson<any>(require('./data/CREATE_FILE_DATA.SUCCESS.json')),
          data => {
            return data;
          },
        );
      } else {
        helper.mockApi(
          {
            host: 'glip',
            path: 'api/s3/v1/post-policy',
            method: 'post',
          },
          errorMessage,
        );
      }

      if (data.uploadFileSuccess) {
        helper.mockResponse(
          readApiJson<any>(require('./data/UPLOAD_FILE.SUCCESS.json')),
          data => {
            return data;
          },
        );
      } else {
        helper.mockApi(
          {
            host: 'glipasialabnet-glpdevxmn.s3-accelerate.amazonaws.com/',
            path: '',
            method: 'POST',
          },
          {
            status: 500,
          },
        );
      }
    }

    it.each`
      personSuccess | createFileSuccess | uploadFileSuccess | comment
      ${true}       | ${true}           | ${false}          | ${'upload file failed'}
      ${true}       | ${false}          | ${true}           | ${'create file data failed'}
      ${false}      | ${true}           | ${true}           | ${'update person failed'}
    `(
      'should throw error when $comment',
      async ({ personSuccess, createFileSuccess, uploadFileSuccess }) => {
        preSetApi({ personSuccess, createFileSuccess, uploadFileSuccess });
        const updateData = {
          first_name: 'f_n',
          last_name: 'l_n',
          homepage: 'h.com',
          job_title: 'jpt engineer',
          location: 'xmn',
        };

        try {
          await personService.editPersonalInfo(updateData, {
            file,
            offset: '560x0',
            crop: '1440x1440',
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      },
    );
  });
});
