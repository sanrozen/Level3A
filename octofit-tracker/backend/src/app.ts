import express from 'express';
import apiRouter from './routes/api';

const app = express();

app.use(express.json());
app.use(apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use(
  (error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error('API request failed:', error);
    response.status(500).json({ error: 'Internal server error' });
  },
);

export default app;
