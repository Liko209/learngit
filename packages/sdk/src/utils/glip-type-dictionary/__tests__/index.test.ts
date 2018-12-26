import { GlipTypeUtil, TypeDictionary, parseSocketMessage } from '../index';

describe('GlipTypeUtil', () => {
  it('GlipTypeUtil   isIntegrationType / extractTypeId', () => {
    const integrationType = GlipTypeUtil.isIntegrationType(12);
    expect(integrationType).toBe(false);

    const extractType = GlipTypeUtil.extractTypeId(12);
    expect(extractType).toBe(12);
  });

  it('TypeDictionary', () => {
    const res = TypeDictionary.TYPE_ID_COMPANY;
    expect(res).toBe(1);
  });

  it('parseSocketMessage: state', () => {
    const res = parseSocketMessage('{"body":{"objects": [[{"_id":7}]]}}');
    expect(res).toEqual({
      state: [
        {
          _id: 7,
        },
      ],
    });
  });
  it('parseSocketMessage: group', () => {
    const res = parseSocketMessage(
      '{"body": {"timestamp": 1536061961508, "message_id": "user_id:1376259;id:f3839af4-ab2e-4f21-8f09-f874080771a7", ' +
        '"pending_object_ids": [], "partial": true, "hint": {"post_creator_ids":{"532439044":1376259}}, ' +
        '"objects": [[{"_id":532486,"version":7383248413917184,"modified_at":1536061960642,"post_cursor":1995}]]}}',
    );
    expect(res).toEqual({
      group: [
        {
          _id: 532486,
          modified_at: 1536061960642,
          post_cursor: 1995,
          __trigger_ids: [1376259],
          version: 7383248413917184,
        },
      ],
    });
  });
  it('parseSocketMessage: invalid data', () => {
    expect(parseSocketMessage('1')).toBeNull;
    expect(parseSocketMessage('io client disconnect')).toBeNull;
  });
});
