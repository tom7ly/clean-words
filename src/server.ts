const express = require('express')
const app = express();
import { ServerController } from './server-controller';
import { Request, Response } from 'express';

const port = 8000;
const dbFilePath = 'words_clean.txt';
const serverController = new ServerController(dbFilePath);

app.get('/similar', (req: Request, res: Response) => {
  serverController.totalRequests++;
  const word: string = req?.query?.word as string;
  if (!word) {
    res.status(400).json({ error: "Missing word query parameter" });
  }
  
  try {
    const startTime = process.hrtime();
    const similar = serverController.findSimilarWords(word);
    const endTime = process.hrtime();
    serverController.calculateRequestTime(startTime, endTime);
    res.json({ similar });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get('/stats', (req: Request, res: Response) => {
  try {
    res.json({
      totalWords: serverController.totalWords,
      totalRequests: serverController.totalRequests,
      avgProcessingTimeNs: serverController.getAverageProcessingTimeNs(),
      requestTimes: serverController.requestTimes,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
