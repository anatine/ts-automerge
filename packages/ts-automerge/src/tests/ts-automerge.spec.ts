import { Automerge, init } from '../lib/ts-automerge';

describe('tsAutomerge', () => {
  it('should initialize an automerge instance', () => {
    const result = init();
    expect(result instanceof Automerge).toBe(true);
  });
});
