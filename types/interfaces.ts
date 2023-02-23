export interface IProbeReading {
    id: string,
    probe: number,
    createdAt: Date
}

export interface IBatchProbeReading extends IProbeReading {
    batchId: number
}
export interface IDailyProbeReading extends IProbeReading {
    expireAt: Date
}

export interface IBatch {
    id: string,
    name:string,
    weight: number,
    origin: string
}