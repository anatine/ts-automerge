/* eslint-disable @typescript-eslint/no-empty-interface */
export type ActorId = string;
export type AutomergeDoc<T> = FreezeObject<T>;
export type Proxy<D> = D extends AutomergeDoc<infer T> ? T : never;

export type ChangeFn<T> = (doc: T) => void;

export type Hash = string; // 64-digit hex string
export type OpId = string; // of the form `${counter}@${actorId}`
export type UUID = string;

export type BinaryChange = Uint8Array & { __binaryChange: true };
export type BinaryDocument = Uint8Array & { __binaryDocument: true };
export type BinarySyncState = Uint8Array & { __binarySyncState: true };
export type BinarySyncMessage = Uint8Array & { __binarySyncMessage: true };

export interface Patch {
  actor?: string;
  seq?: number;
  pendingChanges: number;
  clock: Clock;
  deps: Hash[];
  diffs: MapDiff;
  maxOp: number;
}

export type PatchCallback<T> = (
  patch: Patch,
  before: T,
  after: T,
  local: boolean,
  changes: BinaryChange[]
) => void;

export interface Observable {
  observe<T>(object: T, callback: ObserverCallback<T>): void;
}

export type ObserverCallback<T> = (
  diff: MapDiff | ListDiff | ValueDiff,
  before: T,
  after: T,
  local: boolean,
  changes: BinaryChange[]
) => void;

export interface Clock {
  [actorId: string]: number;
}

export interface Table<T> {
  add(item: T): UUID;
  byId(id: UUID): T & TableRow;
  count: number;
  ids: UUID[];
  remove(id: UUID): void;
  rows: (T & TableRow)[];
}

export interface TableRow {
  readonly id: UUID;
}

export interface List<T> extends Array<T> {
  insertAt?(index: number, ...args: T[]): List<T>;
  deleteAt?(index: number, numDelete?: number): List<T>;
}

export type ReadonlyTable<T> = ReadonlyArray<T> & Table<T>;
export type ReadonlyList<T> = ReadonlyArray<T> & List<T>;
export type ReadonlyText = ReadonlyList<string> & Text;

// Describes changes to a map (in which case propName represents a key in the
// map) or a table object (in which case propName is the primary key of a row).
export interface MapDiff {
  objectId: OpId; // ID of object being updated
  type: 'map' | 'table'; // type of object being updated
  // For each key/property that is changing, props contains one entry
  // (properties that are not changing are not listed). The nested object is
  // empty if the property is being deleted, contains one opId if it is set to
  // a single value, and contains multiple opIds if there is a conflict.
  props: {
    [propName: string]: { [opId: string]: MapDiff | ListDiff | ValueDiff };
  };
}

// Describes changes to a list or Automerge.Text object, in which each element
// is identified by its index.
export interface ListDiff {
  objectId: OpId; // ID of object being updated
  type: 'list' | 'text'; // type of objct being updated
  // This array contains edits in the order they should be applied.
  edits: (SingleInsertEdit | MultiInsertEdit | UpdateEdit | RemoveEdit)[];
}

// Describes the insertion of a single element into a list or text object.
// The element can be a nested object.
export interface SingleInsertEdit {
  action: 'insert';
  index: number; // the list index at which to insert the new element
  elemId: OpId; // the unique element ID of the new list element
  opId: OpId; // ID of the operation that assigned this value
  value: MapDiff | ListDiff | ValueDiff;
}

// Describes the insertion of a consecutive sequence of primitive values into
// a list or text object. In the case of text, the values are strings (each
// character as a separate string value). Each inserted value is given a
// consecutive element ID: starting with `elemId` for the first value, the
// subsequent values are given elemIds with the same actor ID and incrementing
// counters. To insert non-primitive values, use SingleInsertEdit.
export interface MultiInsertEdit {
  action: 'multi-insert';
  index: number; // the list index at which to insert the first value
  elemId: OpId; // the unique ID of the first inserted element
  values: number[] | boolean[] | string[] | null[]; // list of values to insert
  datatype?: DataType; // all values must be of the same datatype
}

// Describes the update of the value or nested object at a particular index
// of a list or text object. In the case where there are multiple conflicted
// values at the same list index, multiple UpdateEdits with the same index
// (but different opIds) appear in the edits array of ListDiff.
export interface UpdateEdit {
  action: 'update';
  index: number; // the list index to update
  opId: OpId; // ID of the operation that assigned this value
  value: MapDiff | ListDiff | ValueDiff;
}

// Describes the deletion of one or more consecutive elements from a list or
// text object.
export interface RemoveEdit {
  action: 'remove';
  index: number; // index of the first list element to remove
  count: number; // number of list elements to remove
}

// Describes a primitive value, optionally tagged with a datatype that
// indicates how the value should be interpreted.
export interface ValueDiff {
  type: 'value';
  value: number | boolean | string | null;
  datatype?: DataType;
}

export type OpAction =
  | 'del'
  | 'inc'
  | 'set'
  | 'link'
  | 'makeText'
  | 'makeTable'
  | 'makeList'
  | 'makeMap';

export type CollectionType =
  | 'list' //..
  | 'map'
  | 'table'
  | 'text';

export type DataType = 'int' | 'uint' | 'float64' | 'counter' | 'timestamp';

// TYPE UTILITY FUNCTIONS

// Type utility function: Freeze
// Generates a readonly version of a given object, array, or map type applied recursively to the nested members of the root type.
// It's like TypeScript's `readonly`, but goes all the way down a tree.

export type Freeze<T> = T extends Text
  ? ReadonlyText
  : T extends Table<infer T>
  ? FreezeTable<T>
  : T extends List<infer T>
  ? FreezeList<T>
  : T extends Array<infer T>
  ? FreezeArray<T>
  : T extends Map<infer K, infer V>
  ? FreezeMap<K, V>
  : T extends string & infer O
  ? string & O
  : FreezeObject<T>;

export interface FreezeTable<T> extends ReadonlyTable<Freeze<T>> {}
export interface FreezeList<T> extends ReadonlyList<Freeze<T>> {}
export interface FreezeArray<T> extends ReadonlyArray<Freeze<T>> {}
export interface FreezeMap<K, V> extends ReadonlyMap<Freeze<K>, Freeze<V>> {}
export type FreezeObject<T> = { readonly [P in keyof T]: Freeze<T[P]> };
