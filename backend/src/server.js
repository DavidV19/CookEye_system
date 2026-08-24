import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import iotRouter from './routes/iot_routes.js';
import processesRouter from './routes/processes_routes.js'; // opcional

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(morgan('dev'));

app.use('/api', iotRouter);
app.use('/api/processes', processesRouter); // opcional, útil para frontend

app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 y error handler opcionales…

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
