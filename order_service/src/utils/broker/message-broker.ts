import dotenv from "dotenv";
import { Consumer, Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import { MessageBrokerType, MessageHandler, PublishType } from "./broker.type";
import { MessageType, OrderEvent, TOPIC_TYPE } from "../../types";


dotenv.config()
const CLIENT_ID = process.env.CLIENT_ID || "order-service";
const GROUP_ID = process.env.GROUP_ID || "order-service-group";
const BROKERS = [process.env.BROKER_1 || "localhost:9092"];

const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: BROKERS,
    logLevel: logLevel.INFO
});

let producer: Producer;
let consumer: Consumer;

const createTopic = async(topic:string[])=> {
    const topics = topic.map((t) => ({
        topic: t,
        numPartitions: 2,
        replicationFactor: 1 // based upon available brokers
    }))

    const admin = kafka.admin();
    await admin.connect();
    const topicExists = await admin.listTopics();
    for(const t of topics) {
        if(!topicExists.includes(t.topic)) {
            await admin.createTopics({
                topics: [t],
            })
        }
    }
    await admin.disconnect()
}

const connectProducer = async<T>():Promise<T> => {
    await createTopic(["OrderEvents"]);

    if(producer) {
        console.log("Producer already connected with existing connection")
        producer = kafka.producer();
    }

    producer = kafka.producer({
        createPartitioner: Partitioners.DefaultPartitioner,
    })

    await producer.connect();
    console.log("Producer connected connected with new connection")
    return producer as unknown as T;
}

const disConnectProducer = async():Promise<void> => {
    if(producer) {
        await producer.disconnect();
    }
};

export const publish = async(data: PublishType): Promise<boolean> => {
    const producer = await connectProducer<Producer>();
    const result = await producer.send({
        topic: data.topic,
        messages: [
            {
                headers: data.headers,
                key: data.event,
                value: JSON.stringify(data.message),
            },
        ],
    });
    console.log("publishing result",result)
    return !result;
}

const connectConsumer = async<T>(): Promise<T> => {
    if(consumer) {
        return consumer as unknown as T;
    }

    consumer = kafka.consumer({
        groupId: GROUP_ID,
    });

    await consumer.connect();
    return consumer as unknown as T;
}

const disConnectConsumer = async(): Promise<void> => {
    if(consumer) {
        await consumer.disconnect();
    }
}

const subscribe = async(
    messageHandler: MessageHandler,
    topic: TOPIC_TYPE
):Promise<void> => {
    const consumer = await connectConsumer<Consumer>();
    consumer.subscribe({topic: topic, fromBeginning: true});

    await consumer.run({
        eachMessage: async({topic, partition,message}) => {
            if(topic !== "OrderEvents") {
                return;
            }

            if(message.key && message.value) {
                const inputMessage: MessageType = {
                    headers: message.headers,
                    event: message.key.toString() as OrderEvent,
                    data: message.value ? JSON.parse(message.value.toString()) : null,
                };
                await messageHandler(inputMessage);
                await consumer.commitOffsets([
                    {topic,partition,offset:(Number(message.offset)+1).toString()},
                ]);
            }
        },
    });
};
  
export const MessageBroker: MessageBrokerType = {
    connectProducer,
    disConnectProducer,
    publish,
    connectConsumer,
    disConnectConsumer,
    subscribe,
}