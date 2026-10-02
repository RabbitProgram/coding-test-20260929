import { AppController } from './app.controller.js';

describe('AppController', () => {
  it('GET / は status: ok を返す', () => {
    expect(new AppController().getStatus()).toEqual({ status: 'ok' });
  });
});
