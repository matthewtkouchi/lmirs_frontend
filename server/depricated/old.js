const express = require('express')
const {spawn} = require('child_process')
const app = express()
const PORT = 5001;

function getTS() {
    const timestamp = Date.now(); // This would be the timestamp you want to format
  
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp);
}

function logPrint(response, statement) {
    response.send(statement);
    console.log(`[${getTS()}] ${statement}`);
}


app.get("/log", (req,res) => {
    // res.json({"users": ["UserOne", "UserTwo", "UserThree", "UserFour", "AnotherThing"]})
    
    let dataToSend;

    // spawn new child process to call python script
    const python = spawn('python', ['./scripts/test.py']);

    // collect data from script
    python.stdout.on('data', function (data) {
        logPrint(res, "[Server] Pipe data from python script..");
        dataToSend = data.toString();
    })

    // in close event we are sure that the stream from child process is closed
    python.on('close', (code) => {
        logPrint(res, `[Server] child process close all stdio with code ${code}`);
    
        // send data to browser
        res.json({"timestamp": getTS(), "data": [`${dataToSend}`]});
    });

})

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`[${getTS()}] [Server] Server Started on PORT ${PORT}`)
})
