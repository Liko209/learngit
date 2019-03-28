/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 14:52:37
 */

import axios from "axios";
import { LogUtils } from '../utils';

const WebSocket = require('ws');
const Connection = require('lighthouse/lighthouse-core/gather/connections/connection');
const logger = LogUtils.getLogger(__filename);

/*
 * Electron don't support to create tab, so not need to close tab
 */
class ElectronConnection extends Connection {
  private cmdCache = [];
  /**
     * @param {number=} port Optional port number. Defaults to 9222;
     * @param {string=} hostname Optional hostname. Defaults to localhost.
     * @constructor
     */
  constructor(port, hostname) {
    super();
    this.port = port;
    this.hostname = hostname;
    this._ws = null;
  }

  /**
   * @override
   * @return {Promise<void>}
   */
  connect() {
    return this._runJsonCommand('list').then(tabs => {
      if (!Array.isArray(tabs) || tabs.length === 0) {
        return Promise.reject(new Error('Cannot create new tab, and no tabs already open.'));
      }

      let firstTab = tabs[0];
      for (let item of tabs) {
        if (item['type'] === 'page') {
          firstTab = item;
          break;
        }
      }

      return this._connectToSocket(firstTab);
    });
  }

  /**
   * @param {LH.DevToolsJsonTarget} response
   * @return {Promise<void>}
   * @private
   */
  _connectToSocket(response) {
    const url = response.webSocketDebuggerUrl;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, {
        perMessageDeflate: false,
      });

      ws.on('open', () => {
        this._ws = ws;

        for (let message of this.cmdCache) {
          this._ws.send(message);
        }
        resolve();
      });
      ws.on('message', data => this.handleRawMessage(/** @type {string} */(data)));
      ws.on('close', this.dispose.bind(this));
      ws.on('error', reject);
    });
  }

  /**
   * @param {string} command
   * @return {Promise<LH.DevToolsJsonTarget | Array<LH.DevToolsJsonTarget> | {message: string}>}
   * @private
   */
  _runJsonCommand(command) {
    return new Promise((resolve, reject) => {
      axios.get(`http://${this.hostname}:${this.port}/json/${command}`).then((response) => {
        resolve(response.data);
      })
    });
  }

  /**
   * @override
   * @return {Promise<void>}
   */
  disconnect() {
    if (this._ws) {
      this._ws.removeAllListeners();
      this._ws.close();
      this._ws = null;
      return Promise.resolve();
    }
  }

  /**
   * @override
   * @return {Promise<string>}
   */
  wsEndpoint() {
    return this._runJsonCommand('version').then(response => {
      return response['webSocketDebuggerUrl'];
    });
  }


  /**
   * @override
   * @param {string} message
   * @protected
   */
  sendRawMessage(message) {
    if (!this._ws) {
      this.cmdCache.push(message);
      // logger.error('ElectronConnection', 'sendRawMessage() was called without an established connection.');
      // throw new Error('sendRawMessage() was called without an established connection.');
    }
    this._ws.send(message);
  }
}

export {
  ElectronConnection
}
