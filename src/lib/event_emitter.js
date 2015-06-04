/**
 * A simple event-emitter class. Like Node's but much simpler.
 */

export default class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  emit(name, ...args) {
    // console.log('emit', name, args, this._listeners);
    (this._listeners[name] || []).forEach(func => func.apply(this, args));
    return this;
  }

  on(name, func) {
    if (name in this._listeners) {
      this._listeners[name].push(func);
    } else {
      this._listeners[name] = [func];
    }
    return this;
  }

  off(name) {
    if (name) {
      this._listeners[name] = [];
    } else {
      this._listeners = {};
    }
    return this;
  }
}
