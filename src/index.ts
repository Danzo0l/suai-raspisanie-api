import experss, { Request, Response } from 'express';
import cors from 'cors';

import { parseParams, parseTimeTable } from './parser';

interface TypeReq {
  g: number;
  p: number;
  b: number;
  r: number;
}

const allowedOrigins = ['http://localhost:3000', 'http://192.168.1.178:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app: experss.Application = experss();
// app.use(cors);
app.use(cors(options));
const port: number = 8000;

app.get('/api/v1/rasp/:g/:p/:b/:r', async (req: Request<TypeReq>, res: Response) => {
  res
    .status(200)
    .send(
      await parseTimeTable(
        `https://guap.ru/rasp/?g=${req.params.g}&p=${req.params.p}&b=${req.params.b}&r=${req.params.r}`
      )
    );
});

app.get('/api/v1/params', async (req, res) => {
  res.status(200).send(await parseParams('https://guap.ru/rasp/'));
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}` as string);
});
