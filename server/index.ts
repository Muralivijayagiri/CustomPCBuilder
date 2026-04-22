import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import chatRouter from './routes/chat';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', chatRouter);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
