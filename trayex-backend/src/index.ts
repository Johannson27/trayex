import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app';
import { initWs } from './ws';

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

initWs(server);

server.listen(port, () => {
  console.log(`Trayex API listening on http://localhost:${port}`);
});
