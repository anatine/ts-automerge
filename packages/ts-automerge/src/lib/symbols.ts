export const OPTIONS = Symbol('_options'); // object containing options passed to init()
export const CACHE = Symbol('_cache'); // map from objectId to immutable object
export const STATE = Symbol('_state'); // object containing metadata about current state (e.g. sequence numbers)

// Properties of all Automerge objects
export const OBJECT_ID = Symbol('_objectId'); // the object ID of the current object (string)
export const CONFLICTS = Symbol('_conflicts'); // map or list (depending on object type) of conflicts
export const CHANGE = Symbol('_change'); // the context object on proxy objects used in change callback
export const ELEM_IDS = Symbol('_elemIds'); // list containing the element ID of each list element

//
export const DATA = Symbol('_data');
