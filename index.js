const express = require('express');
const app = express();

app.get('/', (req, rest)=>{
    rest.send("Hello world")
})

app.get('/addNewMeetup', (req, resp)=>{
    resp.send("You added a new meetup!")
})

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})

