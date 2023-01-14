const express = require("express");
const dotenv = require("dotenv");
dotenv.config();


const app = express()
const port = process.env.PORT | 3000



app.get("/ambient/:ambientTemp/probe/:probeTemp", (req, res)=>{
    const ambient = req.params.ambientTemp
    const probe = req.params.probeTemp
    res.json({"ambient temperaature":ambient, "probe temperature":probe})
    res.status(200)
    console.log(`ambient : ${ambient}   probe : ${probe} `)
})
app.post("/temperatures", (req, res)=>{
    console.log(req)
    const ambient = req.body.ambient
    const probe = req.body.probe
    // log data in DB
    console.log(`ambient : ${ambient}   probe : ${probe} `)
    res.status(201).send({"ambient temperaature":ambient, "probe temperature":probe})
})


app.listen(port, ()=>{
    console.log(`[SERVER]: Listening on port ${port}`)
})