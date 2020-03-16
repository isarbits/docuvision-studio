import { EventEmitter } from 'events';

export const EventBus = new (class EventBus extends EventEmitter {})();
// export const EventBus = {
//     events: {},
//     emit: function(event: string, ...data: any[]) {
//         if (!this.events[event]) {
//             return;
//         }
//         this.events[event].forEach(([, cb]) => cb(...data));
//     },
//     on: function(event: string, id: string, cb: (...data: any[]) => void) {
//         this.events[event] = [...(this.events[event] ?? []), [id, cb]];
//     },
//     off: function(event: string, id: string) {
//         // this.events[event] = (this.events[event] ?? []).filter(([_id]) => id !== _id);
//         this.events[event] = (this.events[event] ?? []).filter(([_id]) => id !== _id);
//     },
// };
