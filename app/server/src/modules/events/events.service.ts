import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { OPEN, Server } from 'ws';

import { GeneratorService } from '../../shared/generator/generator.service';
import { LoggingService } from '../../shared/logging/logging.service';

type EventData = string | object | number;

interface Client extends WebSocket {
    id: string;
}

interface ConnectedClients {
    [id: string]: Client;
}

interface ClientSubscriptions {
    [channelName: string]: string[];
}

@Injectable()
@WebSocketGateway(null, { transports: ['websocket'] })
export class EventsService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private readonly server: Server;

    private connectedClients: ConnectedClients = {};
    private subscriptions: ClientSubscriptions = {};

    constructor(private readonly loggingService: LoggingService, private readonly generatorService: GeneratorService) {}

    emit(channel: string, data: EventData) {
        const message = this.dataToString({ channel, data });

        const listeners = this.subscriptions[channel] || [];

        listeners.forEach(clientId => {
            const client = this.connectedClients[clientId];
            if (client?.readyState === OPEN) {
                client.send(message);
            }
        });
    }

    broadcast(channel: string, data: EventData) {
        const message = this.dataToString({ channel, data });

        this.server.clients.forEach(client => {
            if (client.readyState === OPEN) {
                client.send(message);
            }
        });
    }

    send(clientId: string, data: EventData) {
        const message = this.dataToString({ data });

        const client = this.connectedClients[clientId];
        if (client?.readyState === OPEN) {
            client.send(message);
        }
    }

    private dataToString(event: { channel?: string; data: EventData }): string {
        let message: string;
        try {
            message = JSON.stringify(event);
        } catch (error) {
            this.loggingService.error({ message: 'Failed to stringify EventData', event }, error);
            message = null;
        }

        return message;
    }

    handleConnection(client: Client, hello: IncomingMessage): any {
        client.id = this.generatorService.uuid();
        this.connectedClients[client.id] = client;
        this.subscriptions[client.protocol] = [...(this.subscriptions[client.protocol] ?? []), client.id];
        this.loggingService.debug(`OnGatewayConnection [${client.protocol}]`, client.id, hello?.headers?.origin);
    }

    handleDisconnect(client: Client): any {
        delete this.connectedClients[client.id];
        (this.subscriptions[client.protocol] ?? []).filter(id => id !== client.id);
        this.loggingService.debug(`OnGatewayDisconnect [${client.protocol}]`, client.id);
    }
}
