import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import * as dotenv from "dotenv";
import { postgress } from "./db/postgress"
import { probeDailyReposiory } from "./repository/probe-daily-repository";
import { batchReposiory } from "./repository/batch-repository";
import { probeBatchReposiory } from "./repository/probe-batch-repository";

dotenv.config();
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
const port = 3000;

/**
 *  Read the list of latest {limit} or 1800 (30 min) daily probes
 */
app.get("/daily-probes", async (req, res) => {
  const limit = Number(req.query.limit) || 1800;
  const offset = Number(req.query.offset) || 0;
  const dailyProbes = await probeDailyReposiory.getDailyProbes(limit,offset);
  res.status(200).send(dailyProbes)
})

/**
 *  Create a daily probe entry
 */
app.post("/daily-probes", async (req, res) => {
  const probe = Number(req.body.probe);
  const createdDailyProbe = await probeDailyReposiory.insertDailyProbe(probe);
  res.status(201).send(createdDailyProbe);
})

/**
 *  Read the list of latest {limit} or 1800 (30 min) batch probes
 */
app.get("/batch-probes", async (req, res) => {
  const limit = Number(req.query.limit) || 1800;
  const offset = Number(req.query.offset) || 0;
  const batchProbes = await probeBatchReposiory.getBatchProbes(limit,offset);
  res.status(200).send(batchProbes)
})

/**
 *  Create a batch probe entry
 */
app.post("/batch-probes", async (req, res) => {
  const probe = Number(req.body.probe);
  const batchId = Number(req.body.batchId);
  const createdBatchProbe = await probeBatchReposiory.insertBatchProbe(probe,batchId);
  res.status(201).send(createdBatchProbe);
})

/**
 *  Read the list of batches
 */
app.get("/batches", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const batches = await batchReposiory.getBatches(limit,offset);
  res.status(200).send(batches)
})

/**
 *  Create a batch entry
 */
app.post("/batches", async (req, res) => {
  const name = req.body.name;
  const weight = Number(req.body.weight);
  const origin = req.body.origin;
  const createdBatch = await batchReposiory.insertBatch(name,weight,origin);
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
    probeDailyReposiory.insertDailyProbe(probe)
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