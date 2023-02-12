import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import * as dotenv from "dotenv";
import { postgress } from "./db/postgress"
import { IBatch, IBatchProbeReading, IDailyProbeReading } from "./types/interfaces";

dotenv.config();
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
const port = 4000;

/**
 *  Read the list of latest {limit} or 1800 (30 min) daily probes
 */
app.get("/daily-probes", async (req, res) => {
  const limit = Number(req.query.limit) || 1800;
  const offset = Number(req.query.offset) || 0;
  const dailyProbes = await getDailyProbes(limit,offset);
  res.status(200).send(dailyProbes)
})

/**
 *  Create a daily probe entry
 */
app.post("/daily-probes", async (req, res) => {
  const probe = Number(req.body.probe);
  const createdDailyProbe = await insertDailyProbe(probe);
  res.status(201).send(createdDailyProbe);
})

/**
 *  Read the list of latest {limit} or 1800 (30 min) batch probes
 */
app.get("/batch-probes", async (req, res) => {
  const limit = Number(req.query.limit) || 1800;
  const offset = Number(req.query.offset) || 0;
  const batchProbes = await getBatchProbes(limit,offset);
  res.status(200).send(batchProbes)
})

/**
 *  Create a batch probe entry
 */
app.post("/batch-probes", async (req, res) => {
  const probe = Number(req.body.probe);
  const batchId = Number(req.body.batchId);
  const createdBatchProbe = await insertBatchProbe(probe,batchId);
  res.status(201).send(createdBatchProbe);
})

/**
 *  Read the list of batches
 */
app.get("/batches", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const batches = await getBatches(limit,offset);
  res.status(200).send(batches)
})

/**
 *  Create a batch entry
 */
app.post("/batches", async (req, res) => {
  const name = req.body.name;
  const weight = Number(req.body.weight);
  const origin = req.body.origin;
  const createdBatch = await insertBatch(name,weight,origin);
  res.status(201).send(createdBatch);
})

/**
 * Loads test data every second in the probe_readings_daily table for 8331 seconds
 */
const intervalIds:NodeJS.Timer[] = [];
app.get("/load-test-data", async (req, res) => {
  let count = 0;
  const csvData = await fs.promises.readFile("./demo-dataset.csv", 'utf-8');
  const rows = csvData.split('\n');
  const intervalId = setInterval(() => {
    if (count > rows.length) {
      clearInterval(intervalId);
    }
    const probe = Number(rows[count].split(',')[1]); // use 2nd column
    insertDailyProbe(probe)
    ++count
  }, 1000);
 intervalIds.push(intervalId);
})
/**
 * Clears all test load intervals
 */
app.get("/stop-test-data", (req, res) => {
  intervalIds.forEach((id)=>clearInterval(id));
})

/**
 *  Start server and db connection 
 * */
app.listen(port, () => {
  console.log(`[SERVER]: Listening on port ${port}`)
})
postgress.initDbConnection()


/**
 * Functions
 * 
 *  */ 
const getDailyProbes = async (limit:number, offset:number):Promise<IDailyProbeReading[]> => {
  const result = await postgress.dbClient.query(`
  SELECT * FROM public.probe_readings_daily
  ORDER BY created_at DESC
  LIMIT ${limit} OFFSET ${offset};`
  );
  const latestProbes:IDailyProbeReading[] = result.rows.map((row)=>{
    return {
      id:row?.id,
      probe:row?.probe,
      createdAt: row?.created_at,
      expireAt:row?.expire_at
    }
  })

  return latestProbes;
}

const insertDailyProbe = async (probe: number):Promise<IDailyProbeReading> => {
  const result = await postgress.dbClient.query(`
  INSERT INTO public.probe_readings_daily (
  "probe"
  )
  VALUES(
  ${probe}
  )
  RETURNING id, probe, created_at, expire_at;`
  );
  const newDailyProbe:IDailyProbeReading = {
    id:result.rows[0]?.id,
    probe:result.rows[0]?.probe,
    createdAt:result.rows[0]?.created_at,
    expireAt:result.rows[0]?.expire_at
  }
  console.log(
    `New [daily] probe added successfully. DB value: ${JSON.stringify(newDailyProbe)}`
  );
  return newDailyProbe;
}


const getBatchProbes = async (limit:number, offset:number):Promise<IBatchProbeReading[]> => {
  const result = await postgress.dbClient.query(`
  SELECT * FROM public.probe_readings_batch
  ORDER BY created_at DESC
  LIMIT ${limit} OFFSET ${offset};`
  );
  const latestProbes:IBatchProbeReading[] = result.rows.map((row)=>{
    return {
      id:row?.id,
      probe:row?.probe,
      batchId:row?.batch_id,
      createdAt: row?.created_at
    }
  })

  return latestProbes;
}

const insertBatchProbe = async (probe: number,batchId:number):Promise<IBatchProbeReading> => {
  const result = await postgress.dbClient.query(`
  INSERT INTO public.probe_readings_batch (
  "probe",
  "batch_id"
  )
  VALUES(
  ${probe},
  ${batchId}
  )
  RETURNING id, probe, batch_id, created_at;`
  );
  const newDailyProbe:IBatchProbeReading = {
    id:result.rows[0]?.id,
    probe:result.rows[0]?.probe,
    batchId:result.rows[0]?.batch_id,
    createdAt:result.rows[0]?.created_at,
  }
  console.log(
    `New [batch] probe added successfully. DB value: ${JSON.stringify(newDailyProbe)}`
  );
  return newDailyProbe;
}

const getBatches = async (limit:number, offset:number):Promise<IBatch[]> => {
  const result = await postgress.dbClient.query(`
  SELECT * FROM public.batch
  ORDER BY created_at DESC
  LIMIT ${limit} OFFSET ${offset};`
  );
  const latestBatches:IBatch[] = result.rows.map((row)=>{
    return {
      id:row?.id,
      name:row?.name,
      weight:row?.weight,
      origin:row?.origin,
    }
  })

  return latestBatches;
}

const insertBatch = async (name:string,weight:number,origin:string):Promise<IBatch> => {
  console.log(name+" " + origin+ " "+ weight)
  const result = await postgress.dbClient.query(`
  INSERT INTO public.batch (
  "name",
  "weight",
  "origin"
  )
  VALUES(
  '${name}',
  ${weight},
  '${origin}'
  )
  RETURNING id, name, weight, origin;`
  );
  const newBatch:IBatch = {
    id:result.rows[0]?.id,
    name:result.rows[0]?.name,
    weight:result.rows[0]?.weight,
    origin:result.rows[0]?.origin,
  }
  console.log(
    `New batch added successfully. DB value: ${JSON.stringify(newBatch)}`
  );
  return newBatch;
}