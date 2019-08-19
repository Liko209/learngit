import history, { isSameLocation, pushOrReplace } from '@/history';

describe('history', () => {
  describe('isSameLocation()', () => {
    it('should return true when location is same', () => {
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = location;

      expect(isSameLocation(location)).toBeTruthy();
    });
    it('should return true when pathname is different', () => {
      const newLocation = {
        pathname: '/',
      };
      const oldLocation = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = oldLocation;

      expect(isSameLocation(newLocation)).toBeFalsy();
    });
    it('should return true when search is different', () => {
      const newLocation = {
        search: '?',
      };
      const oldLocation = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = oldLocation;

      expect(isSameLocation(newLocation)).toBeFalsy();
    });
    it('should return true when search is hash', () => {
      const newLocation = {
        hash: '#',
      };
      const oldLocation = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = oldLocation;

      expect(isSameLocation(newLocation)).toBeFalsy();
    });
    it('should return true when state is different', () => {
      const newLocation = {
        state: {
          source: '',
        },
      };
      const oldLocation = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = oldLocation;

      expect(isSameLocation(newLocation)).toBeFalsy();
    });
    it('should return true when path is same with history.location and state is same with history.location.state', () => {
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      const path = '';
      const state = location.state;
      history.location = location;

      expect(isSameLocation(path, state)).toBeTruthy();
    });
    it('should return true when path is different with history.location', () => {
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      let path = '/';
      const state = location.state;
      history.location = location;

      expect(isSameLocation(path, state)).toBeFalsy();
      path = '/home?id=1';
      expect(isSameLocation(path, state)).toBeFalsy();
      path = '/home?id=1#one';
      expect(isSameLocation(path, state)).toBeFalsy();
    });
    it('should return true when state is different with history.location.state', () => {
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      const path = `${location.pathname}${location.search}${location.hash}`;
      const state = {
        source: '',
      };
      history.location = location;

      expect(isSameLocation(path, state)).toBeFalsy();
    });
  });

  describe('pushOrReplace()', () => {
    it('should return function', () => {
      const action = jest.fn();
      expect(typeof pushOrReplace(action)).toBe('function');
    });
    it('should not be call action when location is same', () => {
      const action = jest.fn();
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = location;
      pushOrReplace(action)(location);
      expect(action).not.toHaveBeenCalled();
    });

    it('should be call action when location is different', () => {
      const action = jest.fn();
      const newLocation = {
        pathname: '/',
      };
      const oldLocation = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = oldLocation;
      pushOrReplace(action)(newLocation);
      expect(action).toHaveBeenCalled();
    });
    it('should be call pathName when location is different', () => {
      const action = jest.fn();
      const location = {
        pathname: '',
        search: '',
        hash: '',
        key: '',
        state: {},
      };
      history.location = location;
      const path = `${location.pathname}${location.search}${location.hash}`;
      const state = {
        source: '',
      };
      pushOrReplace(action)(path, state);
      expect(action).toHaveBeenCalled();
    });
  });
});
