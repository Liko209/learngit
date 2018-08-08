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

  it('parseSocketMessage', () => {
    const res = parseSocketMessage('{"body":{"objects": [[{"_id":7}]]}}');
    expect(res).toEqual({
      state: [
        {
          _id: 7,
        },
      ],
    });
  });
});
