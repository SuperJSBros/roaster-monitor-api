import { postgress } from "../db/postgress";
import { IDailyProbeReading } from "../types/interfaces";

class ProbeDailyReposiory {
    public getDailyProbes = async (limit:number, offset:number):Promise<IDailyProbeReading[]> => {
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
      
      public insertDailyProbe = async (probe: number):Promise<IDailyProbeReading> => {
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
}
export const probeDailyReposiory: ProbeDailyReposiory = new ProbeDailyReposiory();