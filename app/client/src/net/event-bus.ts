import { EventEmitter } from 'events';

export const EventBus = new (class EventBus extends EventEmitter {})();
