import { postgress } from "../db/postgress";
import { IBatchProbeReading } from "../types/interfaces";

class ProbeBatchReposiory {
    public getBatchProbes = async (limit:number, offset:number):Promise<IBatchProbeReading[]> => {
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
      
      public insertBatchProbe = async (probe: number,batchId:number):Promise<IBatchProbeReading> => {
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
}
export const probeBatchReposiory: ProbeBatchReposiory = new ProbeBatchReposiory();