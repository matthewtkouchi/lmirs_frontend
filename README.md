# psychic-succotash



## Setup

Installing DAQ Dependencies,
1. Follow [How to Use the DAQ.docx]() to install the NI-DAQmx driver and Python API.
2. The DAQ python script is located at ```server/scripts/demux_redux.py``` 

Installing NodeJS,
1. Go to https://nodejs.org/en/download
2. Pick the LTS installer for your OS. Use version 18.17.0 or higher.
3. Run NodeJS installer and reboot computer when finished.

For client,
1. In a terminal window, go to the ```client/``` directory 
2. Run ```npm install``` to install all dependencies
3. Open file ```client/src/components/TopInterface.tsx```
4. Edit line 21 with the IP address of the current machine. Don't change the port number.

For server,
1. In a terminal window, go to the ```server/``` directory 
2. Run ```npm install``` to install all dependencies
3. Open file ```server/server.js```
4. Edit line 25 with the IP address of the current machine. Don't change the port number.



## Run

For client,
1. In a terminal window, go to the ```client/``` directory 
2. Run ```npm run dev```

For server,
1. In a terminal window, go to the ```server/``` directory 
2. Run ```npm run dev```

Run the client and server simultaneously in separate terminal windows. 

Open browser and visit [localhost:3000](http://localhost:3000/)

## Warning

The control system resets connection to the server after a page refresh.

If the the connection is reset while the script is running, the DAQ must be switched off manually. 

This is currently being addressed. 
