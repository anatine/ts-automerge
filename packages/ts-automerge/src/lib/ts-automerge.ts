import {
  ActorId,
  AutomergeDoc,
  Observable,
  PatchCallback,
} from './type-generics';

export function tsAutomerge(): string {
  return 'ts-automerge';
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
