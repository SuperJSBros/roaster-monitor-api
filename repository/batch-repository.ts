import { postgress } from "../db/postgress";
import { IBatch } from "../types/interfaces";

class BatchReposiory {
    public getBatches = async (limit:number, offset:number):Promise<IBatch[]> => {
        const result = await postgress.dbClient.query(`
        SELECT * FROM public.batch
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
      
      public insertBatch = async (name:string,weight:number,origin:string):Promise<IBatch> => {
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
}
export const batchReposiory: BatchReposiory = new BatchReposiory();