import { socketHost } from '../config';

type Listener = (event: any, rawEvent?: Event) => void;
type ErrHandler = (type: 'onclose' | 'onerror', evt: Event) => void;

export const subscribe = (name: string, on: Listener, err?: ErrHandler) => {
    const socket = new WebSocket(socketHost, name);

    if (!err) {
        socket.onclose = (evt) => console.warn('socket closed', evt);
        socket.onerror = (evt) => console.error('socket error', evt);
    } else {
        socket.onclose = err.bind(err, 'onclose');
        socket.onerror = err.bind(err, 'onerror');
    }

    socket.onmessage = (e) => {
        try {
            on(JSON.parse(e.data).data, e);
        } catch (error) {
            on(null, e);
        }
    };

    return socket;
};
