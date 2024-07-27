import { APP_PORT } from "./config";
import {ExpressApp} from "./express-app";
import { logger } from "./utils";


const PORT = APP_PORT || 9002;

export const StartServer = async ()=> {
    const expressApp = await ExpressApp();
    expressApp.listen(PORT, ()=>{
        logger.info(`App is listening to ${PORT}`)
    })

    process.on("uncaughtException", async(err) => {
        logger.error(err);
        process.exit(1);
    });
};

StartServer().then(()=>{
    logger.info("Server is up");
});