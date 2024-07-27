import express, { NextFunction, Request,Response } from "express";
import cors from 'cors';
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import {MessageBroker} from "./utils/broker"
import { Consumer, Producer } from "kafkajs";

export const ExpressApp = async () => {

    const app = express();
    app.use(cors())
    app.use(express.json());
    app.use(httpLogger);

    const producer = await MessageBroker.connectProducer<Producer>()
    producer.on("producer.connect", ()=>{
        console.log("Producer Connected");
    })

    const consumer = await MessageBroker.connectConsumer<Consumer>();
    consumer.on("consumer.connect", () => {
        console.log("Consumer Connected")
    })

    // subscribe to the topic or publish message

    await MessageBroker.subscribe((message) => {
        console.log("Consumer recieved the message");
        console.log("Message recieved", message);
    },"OrderEvents");
    
    app.use(cartRoutes);
    app.use(orderRoutes);
    app.use("/", (req:Request, res:Response, _:NextFunction) => {
        return res.status(200).json({message: "Working"})
    })
    app.use(HandleErrorWithLogger);

    return app;
}