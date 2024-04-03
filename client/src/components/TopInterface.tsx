import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getTS, handleFileDownload } from "../utils/general";
import { AntennaPatternType, defaultActuatedCells } from "../utils/actuation";
import TiledArrayForm from "./TiledArrayForm";
// import MultiArrayForm from "./MultiArrayForm";
// import LogOutput from "./LogOutput";

// SOCKET EVENTS (see server.js)
const submitEvent = "submitEvent"; // 'submit' signal (client to server)
const stopButtonEvent = "stopButtonEvent"; // 'stop' signal (client to server)
const serverLogEvent = "serverLogEvent"; // send logging information from (server to client)
const programRunningEvent = "programRunningEvent"; // python script start (server to client)
const cellActuationEvent = "cellActuationEvent"; // indicate specific cell is actuated (server to client)
const requestAntennaPatternEvent = "requestAntennaPatternEvent"
const respondAntennaPatternEvent = "respondAntennaPatternEvent"

// INIT Sockets
const socket = io("http://localhost:5001");


function TopInterface() {

  const [logData, setLogData] = useState<string>(
    `[${getTS()}] [Client] Init App..`
  );
  const [isResetButtonPressed, setIsResetButtonPressed] = useState<boolean>(false);
  const [currentFormData, setCurrentFormData] = useState<object>([{}]);
  // const [multiArrayFormData, setMultiArrayFormData] = useState<object>([{}]);
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const [actuatedCells, setActuatedCells] = useState<object>(
    JSON.parse(JSON.stringify(defaultActuatedCells))
  );
  const [isAntennaPatternRequested, setIsAntennaPatternRequested] = useState<boolean>(false)
  const [antennaPatternResponse, setAntennaPatternResponse] = useState<Array<number>>([0])
  const [arrayPage, setArrayPage] = useState<number>(1); // for switching pages 


  // Reset Actuated Cells when Stop Button is pressed.
  useEffect(() => {
    if (!isFormDisabled) {
      setActuatedCells(JSON.parse(JSON.stringify(defaultActuatedCells)))
    }
  }, [isFormDisabled]);

  // Trigger functions on inbound socket connections
  socket.on("connect_error", () => setTimeout(() => socket.connect(), 5000));
  socket.on("connect", () =>
    setLogData(`[${getTS()}] [Client] Connected to Server [ID: ${socket.id}]`)
  );
  socket.on("disconnect", () =>
    setLogData(`[${getTS()}] [Client] Disconnected from Server.`)
  );

  socket.on(serverLogEvent, (data) => {
    setLogData(data);
  });
  socket.on(programRunningEvent, (data) => {
    setIsFormDisabled(data);
  });
  
  // Keep track of which individual cells have been actuated by the python script
  // Used for demo purposes to highlight the actuated cells in green on the frontend 
  socket.on(cellActuationEvent, (data) => {
    const cellVal = parseInt(data.split(" ").at(-1));
    setActuatedCells(actuatedCells => ({
      ...actuatedCells,
      ...{ [cellVal as keyof typeof actuatedCells]: true }
    }));
  });
  
  // ANTENNA PATTERN
  // receive antenna pattern data from backend
  socket.on(respondAntennaPatternEvent, (data) => {
    console.log("raw", data)
    setAntennaPatternResponse(JSON.parse(data))
    
  });

  // Initiate antenna pattern request when button is pressed
  useEffect(() => {
    if (isAntennaPatternRequested) {
      socket.emit(requestAntennaPatternEvent, currentFormData)
      setIsAntennaPatternRequested(false)
    }
  }, [isAntennaPatternRequested])

  return (
    <div className="">

      <nav className="navbar sticky-top navbar-light bg-light mb-5 shadow-sm navbar-expand-lg">
        <div className="container-fluid">
          <span className="navbar-brand pt-2 mx-auto my-auto mx-md-5 h1 text-align-center">Control System App</span>
          <ul className="navbar-nav nav-underline me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className={`nav-link ${(arrayPage == 0) ? "active" : ""}`} aria-current="page" href="#" onClick={() => setArrayPage(0)}>Arrays</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${(arrayPage == 1) ? "active" : ""}`} aria-current="page" href="#" onClick={() => setArrayPage(1)}>Cells</a>
            </li>
          </ul>


          <div className="btn-toolbar float-end mx-md-5" role="toolbar">

            {/* DEBUG BUTTON */}
            {/* <button
              className="btn btn-secondary ms-2 my-2"
              id="debugButton"
              // type="debug"
              value="debug"
              onClick={() => {
                setLogData(`[${getTS()}] [Client] debug Button Pressed`);
                console.log("debug", antennaPatternResponse)
              }}
              disabled={isFormDisabled}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button> */}

            {/* DOWNLOAD BUTTON */}
            <button
              className="btn btn-secondary ms-2 my-2"
              id="stopButton"
              type="button"
              value="Download"
              onClick={() => {
                setLogData(`[${getTS()}] [Client] Download Button Pressed`);
                handleFileDownload("configuration_file.json", currentFormData)
              }}
              disabled={isFormDisabled}
            >
              Download Configuration
            </button>

            {/* STOP BUTTON */}
            <button
              className="btn btn-danger ms-2 my-2"
              id="stopButton"
              type="button"
              value="Stop"
              onClick={() => {
                setLogData(`[${getTS()}] [Client] Stop Button Pressed`);
                socket.emit(stopButtonEvent, "SIGINT\n");
              }}
              disabled={!isFormDisabled}
            >
              Stop Program
            </button>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-success ms-2 my-2"
              id="submitButton"
              type="submit"
              form="configForm"
              value="Submit"
              onClick={() => {
                setLogData(`[${getTS()}] [Client] Submit Button Pressed.`);
                console.log("submit button", Object.assign({}, {"timestamp": getTS()}, currentFormData))
                socket.emit(submitEvent, Object.assign({}, {"timestamp": getTS()}, currentFormData))
                setIsAntennaPatternRequested(true)
              }}
              disabled={isFormDisabled}
            >
              Submit
            </button>

            {/* RESET BUTTON */}
            <button
              className="btn btn-secondary ms-2 my-2"
              id="resetButton"
              type="reset"
              value="Reset"
              onClick={() => {
                setLogData(`[${getTS()}] [Client] Reset Button Pressed`);
                setIsResetButtonPressed(!isResetButtonPressed);
              }}
              disabled={isFormDisabled}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>

          </div>

        </div>
      </nav>

      {/* MULTI ARRAY FORM COMPONENT */}
      {/* <div style={arrayPage == 1 ? { display: "none" } : {}}>
        <MultiArrayForm
          isResetButtonPressed={isResetButtonPressed}
          handleMultiArrayFormData={setMultiArrayFormData}
          currentFormData={currentFormData}
          isFormDisabled={isFormDisabled}
          actuatedCells={actuatedCells}
        />
      </div> */}

      {/* TILED ARRAY FORM COMPONENT */}
      <div style={arrayPage == 0 ? { display: "none" } : {}}>
        <TiledArrayForm
          isResetButtonPressed={isResetButtonPressed}
          isFormDisabled={isFormDisabled}
          handleCurrentFormData={setCurrentFormData}
          actuatedCells={actuatedCells}
          setIsAntennaPatternRequested={setIsAntennaPatternRequested}
          antennaPatternResponse={antennaPatternResponse}
        />
      </div>

      {/* <br style={{lineHeight: 50}} /> */}

      {/* LOG OUTPUT COMPONENT */}
      {/* <div className="container">
        <LogOutput logData={logData} />
      </div> */}
    </div>
  );
}

export default TopInterface;
