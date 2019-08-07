/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:22
 * Copyright © RingCentral. All rights reserved.
 */
import { Server } from 'mock-socket';
import { createDebug } from 'sdk/__tests__/utils';
import { ISocketInfo } from 'shield/sdk/types';
import { wait } from 'shield/utils';
import { EventEmitter2 } from 'eventemitter2';

import assert = require('assert');

const debug = createDebug('MockSocketServer');

type State = 'connected' | 'disconnected' | 'idle';
export class MockSocketServer {
  socket: any;
  state: State = 'idle';
  private _emitter = new EventEmitter2();
  constructor(url: string) {
    this.socket = new Server(url);
    this.on('connect', () => {
      debug('connect: ', url);
      this.state = 'connected';
      this._emitter.emit('connected');
    });
    this.on('disconnect', () => {
      debug('disconnect: ', url);
      this.state = 'disconnected';
      this._emitter.emit('connected');
    });
    this.on('ping', () => {
      debug('ping', url);
      this.socket.send('pong');
    });
  }

  async ensure(state: State) {
    if (this.state === state) {
      return;
    }
    return new Promise(resolve => {
      this._emitter.once(state, resolve);
    });
  }

  on(channel: string, listener: (message: any) => void) {
    this.socket.on(channel, listener);
  }

  async emit(channel: string, message: any) {
    await this.ensure('connected');
    this.socket.emit(channel, message);
  }

  async emitPacket<T>(packet: ISocketInfo<T>) {
    await this.ensure('connected');
    assert(packet.channel, 'socket packet should contain channel info.');
    assert(packet.data, 'socket packet should contain data.');
    debug('-> emitPacket: ', packet.channel);
    this.socket.emit(packet.channel, JSON.stringify(packet.data));
  }

  async emitEntityCreate(entity: object) {
    await this.ensure('connected');
    debug('-> emitEntityCreate');
    this.socket.emit(
      'message',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          objects: [[{ ...entity }]],
        },
      }),
    );
  }

  async emitMessage(entity: object) {
    await this.ensure('connected');
    debug('-> emitMessage');
    this.socket.emit(
      'message',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          objects: [[{ ...entity }]],
        },
      }),
    );
  }

  async emitPartial(partial: object, partialBody?: object) {
    await this.ensure('connected');
    debug('-> emitPartial', partial);
    this.socket.emit(
      'partial',
      JSON.stringify({
        body: {
          partial: true,
          timestamp: Date.now(),
          objects: [[{ ...partial }]],
          ...partialBody,
        },
      }),
    );
  }
}
