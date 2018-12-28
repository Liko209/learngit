/// <reference path="../../__tests__/types.d.ts" />
import Api from '../api';
import { HandleByGlip } from '../handlers';
import NetworkClient from '../NetworkClient';
import { apiConfig } from './utils';
import { NetworkManager, OAuthTokenManager } from 'foundation';
jest.mock('../NetworkClient');

describe('Api', () => {
  beforeEach(() => {
    Api.init(apiConfig, new NetworkManager(new OAuthTokenManager()));
  });

  describe('getNetworkClient()', () => {
    it('should create a instance', () => {
      Api.getNetworkClient('glip', HandleByGlip);
      expect(NetworkClient.mock.instances).toHaveLength(1);
    });

    it('should return the same  instance', () => {
      const networkClient = Api.getNetworkClient('glip', HandleByGlip);
      expect(networkClient).toBe(Api.getNetworkClient('glip', HandleByGlip));
    });

    it('should throw error when Api not initialized', () => {
      Api._httpConfig = null;
      expect(() => Api.getNetworkClient('glip', HandleByGlip)).toThrow();
    });
  });

  describe('getter', () => {
    it('glipNetworkClient', () => {
      expect(Api.glipNetworkClient).toBeInstanceOf(NetworkClient);
    });

    it('glip2NetworkClient', () => {
      expect(Api.glip2NetworkClient).toBeInstanceOf(NetworkClient);
    });

    it('rcNetworkClient', () => {
      expect(Api.rcNetworkClient).toBeInstanceOf(NetworkClient);
    });

    it('uploadNetworkClient', () => {
      expect(Api.uploadNetworkClient).toBeInstanceOf(NetworkClient);
    });
  });

  describe('customNetworkClient', () => {
    it('should be instance of NetworkClient()', () => {
      const host = 'www.rc.com';
      const customNetworkClient = Api.customNetworkClient(host);
      expect(customNetworkClient).toBeInstanceOf(NetworkClient);
    });
  });
});
