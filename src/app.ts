import 'express-async-errors'
import express, { Application } from "express";
import { measuresRoutes } from './routes/measure.routes';

export const app: Application = express()

const db = require('./persistence');

const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.use("/", measuresRoutes)

db.init().then((): void => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err: any) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon

export default app