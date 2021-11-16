import {
  OPTIONS,
  CACHE,
  STATE,
  OBJECT_ID,
  CONFLICTS,
  CHANGE,
  ELEM_IDS,
  DATA,
} from './symbols';
import {
  ActorId,
  AutomergeDoc,
  ChangeFn,
  Clock,
  Hash,
  Observable,
  PatchCallback,
  Proxy,
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

export function init<T>(options: ActorId | InitOptions<T> = {}): Automerge<T> {
  // Ensure the actor ID is set to an object
  if (typeof options === 'string') {
    options = { actorId: options };
  }
  // Deal with Observables // TODO Refactor into a stream and provide an RxJS external module
  // if (options.observable) {
  //   const patchCallback = options.patchCallback,
  //     observable = options.observable;
  //   options.patchCallback = (patch, before, after, local, changes) => {
  //     if (patchCallback) patchCallback(patch, before, after, local, changes);
  //     observable.patchCallback(patch, before, after, local, changes);
  //   };
  // }
  return new Automerge<T>(options);
}

export function from<T>(
  initialState: T | Automerge<T>,
  options?: InitOptions<T>
): Automerge<T> {
  const changeOpts = { message: 'Initialization' };
  return change(init(options), changeOpts, (doc) =>
    Object.assign(doc, initialState)
  );
}

// TODO Define Change Options
export type ChangeOptions<T> =
  | string // = message
  | {
      message?: string;
      time?: number;
      patchCallback?: PatchCallback<T>;
    };

export function change<T, D = Automerge<T>>(
  doc: D,
  callback: ChangeFn<Proxy<D>>
): D;
export function change<T, D = Automerge<T>>(
  doc: D,
  options: ChangeOptions<Proxy<D>>,
  callback: ChangeFn<Proxy<D>>
): D;
export function change<T, D = Automerge<T>>(
  doc: D,
  optionsOrCallback: ChangeOptions<Proxy<D>> | ChangeFn<Proxy<D>>,
  callback?: ChangeFn<Proxy<D>>
): D {
  if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
    optionsOrCallback = {};
  }
  const options: ChangeOptions<Proxy<D>> = optionsOrCallback;
  const changes = callback && callback(doc as Proxy<D>); // THIS PATCH DOES NOT MATCH TYPE!
  return doc; // TODO Return a new AutomergeRoot
}

export class Automerge<T> {
  readonly [OBJECT_ID]: string = '_root';
  readonly [CONFLICTS]: unknown = {};
  readonly [CACHE]: { _root: Automerge<T> } = { _root: this };
  readonly [STATE]: AutomergeState;
  readonly [OPTIONS]: InitOptions<T>;
  [DATA]: T;

  constructor(options: InitOptions<T>) {
    this[OPTIONS] = Object.freeze(options);
    this[STATE] = Object.freeze({
      seq: 0,
      maxOp: 0,
      requests: [],
      clock: {},
      deps: [],
    });
    // TODO: Add in the CDRT State Methods
  }

  from(initialState: T | Automerge<T>): Automerge<T> {
    if (initialState instanceof Automerge) {
      // TODO: Return a clone of the Automerge
      return initialState;
    }
    if (typeof initialState !== 'object') {
      throw new TypeError('Initial state must be an object or array');
    }
    this[DATA] = initialState;
    return this;
  }
}
