import { GlipTypeUtil, TypeDictionary, parseSocketMessage } from '../index';

describe('GlipTypeUtil', () => {
  it('GlipTypeUtil   isIntegrationType / extractTypeId', () => {
    let integrationType = GlipTypeUtil.isIntegrationType(12);
    expect(integrationType).toBe(false);

    let extractType = GlipTypeUtil.extractTypeId(12);
    expect(extractType).toBe(12);
  });

  it('TypeDictionary', () => {
    let res = TypeDictionary.TYPE_ID_COMPANY;
    expect(res).toBe(1);
  });

  it('parseSocketMessage', () => {
    let res = parseSocketMessage('{"body":{"objects": [[{"_id":7}]]}}');
    expect(res).toEqual({
      'state': [
        {
          '_id': 7
        }
      ]
    });
  });
});