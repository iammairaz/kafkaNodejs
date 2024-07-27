import { MessageType, OrderEvent, TOPIC_TYPE } from "../../types";

export interface PublishType {
    headers: Record<string, any>;
    topic: TOPIC_TYPE;
    event: OrderEvent;
    message: Record<string, any>;
}

export type MessageHandler = (input: MessageType) => void

export type MessageBrokerType = { 
    // producer
    connectProducer: <T>() => Promise<T>;
    disConnectProducer: () => Promise<void>;
    publish: (data:PublishType) => Promise<boolean>;

    // Consumer
    connectConsumer: <T>() => Promise<T>;
    disConnectConsumer: () => Promise<void>;
    subscribe: (messageHandler: MessageHandler, topic:TOPIC_TYPE) => Promise<void>;
}