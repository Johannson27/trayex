import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import authRouter from './routes/auth';
import { catalogRouter } from './routes/catalog';
import { reservationRouter } from './routes/reservations';
import { ticketRouter } from './routes/tickets';
import { etaRouter } from './routes/eta';
import { sosRouter } from './routes/sos';
import { errorHandler } from './middleware/error';
import profileRouter from "./routes/profile"; 
const app = express();
const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(helmet());
app.use(hpp());
app.use(morgan('dev'));
app.use(express.json());

// health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/auth', authRouter);
app.use("/", profileRouter);
app.use('/', catalogRouter);
app.use('/', reservationRouter);
app.use('/', ticketRouter);
app.use('/', etaRouter);
app.use('/', sosRouter);

// error handler
app.use(errorHandler);

export default app;
