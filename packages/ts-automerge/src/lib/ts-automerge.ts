import {
  ActorId,
  AutomergeDoc,
  Clock,
  Hash,
  Observable,
  PatchCallback,
} from './type-generics';

export function tsAutomerge(): string {
  return 'ts-automerge';
}

export interface AutomergeState {
  seq: number;
  maxOp: number;
  requests: unknown[];
  clock: Clock;
  deps: unknown[];
}

export interface InitOptions<T> {
  actorId?: string;
  deferActorId?: boolean;
  freeze?: boolean;
  patchCallback?: PatchCallback<T>;
  observable?: Observable;
}

export function init<T>(
  options: ActorId | InitOptions<T> = {}
): AutomergeDoc<T> {
  if (typeof options === 'string') {
    options = { actorId: options };
  }
  return null as any;
}

class AutomergeRoot<T> {
  readonly _options: InitOptions<T>;
  readonly _state: AutomergeState;
  readonly _cache: { _root: AutomergeRoot<T> };

  constructor(options: InitOptions<T>) {
    this._options = Object.freeze(options);
    this._cache = { _root: this };
    this._state = Object.freeze({
      seq: 0,
      maxOp: 0,
      requests: [],
      clock: {},
      deps: [],
    });
  }
}
