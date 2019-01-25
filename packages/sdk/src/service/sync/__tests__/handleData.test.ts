import handleData from '../handleData';

jest.mock('../../account/handleData', () => jest.fn().mockResolvedValue(true));
jest.mock('../../company/handleData', () => jest.fn().mockResolvedValue(true));
jest.mock('../../presence/handleData', () => jest.fn().mockResolvedValue(true));
<<<<<<< HEAD
jest.mock('../../state/handleData', () => jest.fn().mockResolvedValue(true));
=======

jest.mock('../../person/handleData', () => jest.fn().mockResolvedValue(true));
>>>>>>> stage/1.0.0.190124
jest.mock('../../group/handleData', () => jest.fn().mockResolvedValue(true));
jest.mock('../../post/handleData', () => jest.fn().mockResolvedValue(true));
jest.mock('../../profile/handleData', () => jest.fn().mockResolvedValue(true));

it('handleData()', async () => {
  await handleData({
    data: {},
    status: 200,
    headers: {},
  });
});

it('handleData()', async () => {
  await handleData({
    data: {
      timestamp: 123,
      scoreboard: 'HOST',
      state: {
        a: 1,
      },
      profile: {
        b: 2,
      },
    },
    status: 200,
    headers: {},
  });
});
