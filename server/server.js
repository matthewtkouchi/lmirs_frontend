const express = require("express");
const socketIo = require("socket.io", "net");
const http = require("http");
const { spawn } = require("child_process");

// SocketIO needs HTTP server to work.
// You can’t do app.use(socketIo) here like you’d normally do with libraries such as CORS.
// Instead, create an HTTP server and wrap the express app inside it.
const app = express();
const server = http.createServer(app);
const PORT = 5001;

// SOCKET EVENTS (see TopInterface.tsx)
const submitEvent = "submitEvent"; // 'submit' signal (client to server)
const stopButtonEvent = "stopButtonEvent"; // 'stop' signal (client to server)
const serverLogEvent = "serverLogEvent"; // send logging information from (server to client)
const programRunningEvent = "programRunningEvent"; // python script start (server to client)
const cellActuationEvent = "cellActuationEvent"; // indicate specific cell is actuated (server to client)
const requestAntennaPatternEvent = "requestAntennaPatternEvent"
const respondAntennaPatternEvent = "respondAntennaPatternEvent"

// Init socketIO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // CLIENT ADDRESS
  },
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  // Generate Antenna Pattern
  socket.on(requestAntennaPatternEvent, (data) => {
    logPrint("[Python STDOUT] ", "data requested for antenna pattern!");

    const antennaPatternPython = spawn("python", [
      "-u",
      "./scripts/antenna_pattern_plot.py",
      JSON.stringify(data)
    ]);

    // Send STDOUT data from python script to client
    antennaPatternPython.stdout.on("data", function (data) {
      const dataToSend = data.toString();
      if (dataToSend.startsWith("")) {
        io.emit(respondAntennaPatternEvent, dataToSend);
      }
      logPrint("[Python STDOUT] ", dataToSend);
    });

    // Send STDERR from python script to client log output
    antennaPatternPython.stderr.on("data", function (data) {
      dataToSend = data.toString();
      logPrint("[Python STDERR] ", dataToSend);
    });

    // in close event we are sure that the stream from child process is closed
    antennaPatternPython.on("close", (code, signal) => {
      logPrint(`[Server] Python process terminated with return code ${code}`);
      logPrint(`[Server] Python process terminated due to signal ${signal}`);
      io.emit(programRunningEvent, false);
    });

  });

  // Listen for Client to Press Submit
  socket.on(submitEvent, (data) => {
    io.emit(programRunningEvent, true);

    // Spawn new child process to call python script
    const actuationPython = spawn("python", [
      "-u",
      // "./scripts/testbench/dummy_script_2.py",
      "./scripts/demux_redux.py",
      JSON.stringify(data),
    ]);

    // If stop button is pressed, send 'stop' to python script
    socket.on(stopButtonEvent, (data) => {
      actuationPython.stdin.write(data);
      logPrint("[Server]", "Sending 'STOP' to Python process");
    });

    // Send STDOUT data from python script to client
    actuationPython.stdout.on("data", function (data) {
      const dataToSend = data.toString();
      logPrint("[Python STDOUT] ", dataToSend);
      if (dataToSend.startsWith("actuated cell ")) {
        io.emit(cellActuationEvent, dataToSend);
      }
    });

    // Send STDERR from python script to client log output
    actuationPython.stderr.on("data", function (data) {
      dataToSend = data.toString();
      logPrint("[Python STDERR] ", dataToSend);
    });

    // in close event we are sure that the stream from child process is closed
    actuationPython.on("close", (code, signal) => {
      logPrint(`[Server] Python process terminated with return code ${code}`);
      logPrint(`[Server] Python process terminated due to signal ${signal}`);
      io.emit(programRunningEvent, false);
    });

  });

  socket.on("disconnect", (reason) => {
    console.log("client disconnected", reason);
  });
});

server.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`[${getTS()}] Server Started on PORT ${PORT}`);
});


// Timestamp string for labeling log output
const getTS = () => {
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

// Wrapper function for displaying log output
const logPrint = (domain, ...args) => {
  io.emit(serverLogEvent, `[${getTS()}] ${domain} ${args.toString()}`);
  console.log(`[${getTS()}] ${domain} ${args.toString()}`);
}
