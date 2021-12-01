import express from 'express'
import cors from 'cors'
import {addMeetup, getAllMeetups, uploadFile, getAllReels} from './aws/index'
import multiparty from 'multiparty'
import fs from 'fs'
import { v4 } from 'uuid'

const PORT = process.env.PORT || 8081;
// const fileType = require('file-type');
const app = express();

app.use(express.json())
app.use(express.urlencoded())
app.use(cors())


app.get('/', (req, rest)=>{
    rest.send("Hello world")
})

app.get('/allMeetups', async (req, resp)=>{
    const allMeetups = await getAllMeetups();
    resp.send(allMeetups)
})

app.post('/uploadReel', async (req, resp)=>{
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.error("error parsing file", error);
        return resp.status(500).send(error);
      };
      try {
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        const data = await uploadFile(buffer, `${v4()}---${files.file[0].originalFilename}`);
        return resp.status(200).send({
           fileLocation: data
        });
      } catch (error) {
        console.error("error uploading to s3", error);
        return resp.status(500).send(error);
      }
    });
})

app.get('/getAllReels', async (req, resp)=>{
    try {
        const awsResponse = await getAllReels("jose")
        console.log(awsResponse)
        resp.send(awsResponse)
    }
    catch(error) {
        console.error("Error getting all reels", error)
        resp.status(500).send(error)
    }
    
})

app.post('/addNewMeetup', (req, resp)=>{
    const title = req.body.title
    const address = req.body.address
    const description = req.body.description
    const image = req.body.image
    console.log(`body: ${JSON.stringify(req.body)}`)
    addMeetup(title, image, address, description, (error,data)=>{
        if(error) {
            console.log("unable to add meetup")
            resp.send(error)
        }else {
            console.log("success adding meetup", data)
            resp.send(data)
        }
    })
})

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})

