import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { arrayRange, indexOfMax, indexOfMin, truncateByDecimalPlace, alphabet } from "../utils/general";
import { ConfigurationType, AntennaPatternType, AntennaPatternStatsType } from "../utils/actuation";
import { ReactComponent as InfoIcon } from "../assets/info-lg.svg"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import LookupTable from "../utils/LookupTable.json"

const ConfigurationForm = (
  {
    isResetButtonPressed,
    isFormDisabled,
    handleCurrentFormData,
    actuatedCells,
    setIsAntennaPatternRequested,
    antennaPatternResponse
  }: {
    isResetButtonPressed: boolean,
    isFormDisabled: boolean,
    handleCurrentFormData: (data: object) => void,
    actuatedCells: object,
    setIsAntennaPatternRequested: (data: boolean) => void,
    antennaPatternResponse: Array<number>
  }) => {

  // Initialize form input using React-Hook-Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ConfigurationType>();

  // Collect form data as JSON string upon submit
  const onSubmit: SubmitHandler<ConfigurationType> = () => {
    // console.log("onSubmit", getValues())
  };

  // ** RESET BUTTON **
  // Reset form values when reset button is pressed
  useEffect(() => {
    reset();
    setArrSize(4);
    setFormattedAntennaPatternData([])
    handleCurrentFormData(getValues())
  }, [isResetButtonPressed]);


  // Input Validation for Parameters
  const voltageError = {
    required: "Cannot be blank.",
    max: { value: 10, message: "Must be below 10V." },
    min: { value: -10, message: "Must be above -10V." },
  };
  const dutyCycleError = {
    required: "Cannot be blank.",
    max: { value: 100, message: "Must be percentage." },
    min: { value: 0, message: "Must be percentage." },
    pattern: { value: /^(0|[1-9]\d*)?$/, message: "Must be integer." },
  };


  // ** CELL STYLINGS **
  // Set styling for cells based on actuation (highlight green) and FormDisabled (submit button pressed)
  const styleCyclestateCell = (elementID: string, _rowVal: number, _colVal: number) => {
    let cellElement = document.getElementById(elementID) as HTMLInputElement // grab input element by ID
    let isFormDisabledClassName = isFormDisabled && !cellElement.checked ? "opacity-0" : "" // when form is disabled (when submit button pressed), hide the states that aren't checked
    return " " + isFormDisabledClassName + " " // return these conditional classNames
  }

  // Set styling for cards when cell is actuated (highlight green)
  const styleActuatedCellCard = (elementType: string, _rowVal: number, _colVal: number) => {
    if (elementType == "card-header" && actuatedCells[String(_rowVal * arrSize + _colVal) as keyof typeof actuatedCells]) {
      return { backgroundColor: "seagreen" }
    }
    if (elementType == "card-body" && actuatedCells[String(_rowVal * arrSize + _colVal) as keyof typeof actuatedCells]) {
      return { backgroundColor: "mediumseagreen" }
    }
    return {}
  }

  // ** BITNESS FEATURE **
  // Initialize parameters for adjusting bitness
  const [bitness, setBitness] = useState<number>(1);

  // ** ARRAY DIMENSIONS FEATURE **
  // Initialize parameters for adjusting array size
  const [arrSize, setArrSize] = useState<number>(4); // set dimension for array based on user input, default is 4x4
  const [cellArrayKey, setCellArrayKey] = useState<number>(69420); // set arbitrary key for the array's HTML element. Changing the key will cause re-render
  const [dmuxDimArr, setDmuxDimArr] = useState([...Array(arrSize).keys()]);
  const dimOptions = Array.from({ length: 16 }, (_, i) => i + 1) // used with map() to draw the list of array dimension options for the user to select

  // When user changes the array size
  useEffect(() => {
    setDmuxDimArr([...Array(arrSize).keys()]); // update dmuxDimArr, which is used to draw the cell array 
    setCellArrayKey(Math.random()) // cycle to a new key for #cellArrayDisplay, which re-renders the element
  }, [arrSize]);


  // ** FILE UPLOAD FEATURE **
  const [fileName, setFileName] = useState<string>("") // The name of the file
  const [fileContent, setFileContent] = useState<ConfigurationType>() // The contents of the file

  // Runs when the file is selected for upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type == "application/json") {

      const file = e.target.files[0];
      const reader = new FileReader();

      setTimeout(() => reader.readAsText(file, 'UTF-8'), 100)
      reader.onload = () => {
        setFileName(file.name)
        setFileContent(JSON.parse(reader.result as string) as ConfigurationType)
      };

      reader.onerror = () => {
        console.log('[ERROR]', reader.error)
      }
    } else {
      console.log("[ERROR] Invalid File Type (not .json).")
      return;
    }
  }

  // Runs when the "File Upload" Render button is pressed 
  const handleFileRender = (configData: ConfigurationType | undefined) => {
    if (configData) {
      handleCurrentFormData(configData) // update form data state (to be submitted)

      setArrSize(Number(configData.arrayDimension)) // update state to render frontend
      setValue("arrayDimension", configData.arrayDimension) // update react-hook-form values

      setBitness(Number(configData.bitness)) // update state to render frontend
      setValue("bitness", configData.bitness) // update react-hook-form values

      setTimeout(() => setValue("columns", configData.columns), 100) // update react-hook-form values
      setTimeout(() => setValue("configuration", configData.configuration), 100) // update react-hook-form values

      setIsAntennaPatternRequested(true)

    }
  }

  // ** LOOKUP TABLE FEATURE **
  // Lookup Table Dropdown
  const [lookupTableAngle, setLookupTableAngle] = useState<number>(0) // Define angles
  const angleOptionsMaxLength = 45
  const angleOptionsIncrement = 5
  const angleOptions = arrayRange(-angleOptionsMaxLength, angleOptionsMaxLength, angleOptionsIncrement)
  const lookupTableJSON = LookupTable

  // Returns the configuration of the specified angle, but at the moment the lookup table is empty
  const getDataFromAngle = (lookupTableAngle: number) => {
    return lookupTableJSON[lookupTableAngle]
  }


  // ** ANTENNA PATTERN FEATURE **
  const [formattedAntennaPatternData, setFormattedAntennaPatternData] = useState<Array<object>>([{ name: 0, pF: 0 }])
  const [antennaPatternStats, setAntennaPatternStats] = useState<AntennaPatternStatsType>()
  const thetaX = arrayRange(-90, 90, 1)
  const generateAntennaPattern = () => {
    setAntennaPatternStats({
      "maxPF": Math.max(...antennaPatternResponse),
      "indexMaxPF": thetaX[indexOfMax(antennaPatternResponse)],
      "minPF": Math.min(...antennaPatternResponse),
      "indexMinPF": thetaX[indexOfMin(antennaPatternResponse)]
    })

    var a = []
    for (var i = 0; i < thetaX.length; i++) {
      a.push(
        {
          "name": thetaX[i],
          "pF": antennaPatternResponse[i]
        }
      )
    }
    console.log("a", a, antennaPatternStats)
    setFormattedAntennaPatternData(a)
  }
  useEffect(() => {
    console.log("antennapatternresponse", antennaPatternResponse)
    generateAntennaPattern()
  }, [antennaPatternResponse])

  return (

    <form id="configForm" name="configForm" onSubmit={handleSubmit(onSubmit)} className="needs-validation" onChange={() => { handleCurrentFormData(getValues()); }}>

      <div className="container">
        <div className="row gap-5 gap-md-0">

          {/* ARRAY PATTERN PLOT */}
          <div className="col-12 col-md-6">
            <div id="antennaPatternForm" className="form-group">
              <div className="input-group mb-3">
                <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#antennaPatternInfo">
                  <InfoIcon />
                </button>
                <span className="input-group-text py-0" style={{ fontSize: "medium", position: "relative", flex: "1 1 auto", width: "1%", minWidth: 0 }}>
                  <b>Antenna Pattern</b>
                </span>
                <button
                  className="btn btn-primary align-self-center"
                  id="antennaPatternButton"
                  type="submit"
                  form="antennaPatternForm"
                  value="Render"
                  onClick={() => {
                    setIsAntennaPatternRequested(true)
                    // console.log("check", getValues())
                    console.log("here it is", antennaPatternResponse)
                  }}>
                  Render
                </button>
              </div>
              <div className="py-2 gap-1" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "250px", borderStyle: "solid", borderRadius: "10px", borderWidth: "thin" }}>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    width={350}
                    height={300}
                    data={formattedAntennaPatternData}
                    margin={{
                      top: 15,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    {/* <XAxis dataKey="name" label="&Theta;" ticks={[-75,-50,-25,0,25,50,75]}/> */}
                    <XAxis dataKey="name" ticks={[-75, -50, -25, 0, 25, 50, 75]} />
                    {/* <YAxis dataKey="pF" label={{ value: "Power Factor", angle: -90, position: "insideleft", offset: "50"}} /> */}
                    <YAxis dataKey="pF" />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Line type="monotone" dataKey="pF" dot={false} stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                    {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                  </LineChart>
                </ResponsiveContainer>
                {antennaPatternResponse.length > 1 &&
                  <div className="col-3">
                    <p className="" style={{ fontSize: "0.875rem" }}>
                      <b>Max pF:</b> {antennaPatternStats ? truncateByDecimalPlace(Number(antennaPatternStats.maxPF), 2) + " dB" : "--"}
                      <br />
                      <b>at angle:</b> {antennaPatternStats ? antennaPatternStats.indexMaxPF + "\u00B0" : "--"}
                    </p>
                    <p className="" style={{ fontSize: "0.875rem" }}>
                      <b>Min pF:</b> {antennaPatternStats ? truncateByDecimalPlace(Number(antennaPatternStats.minPF), 2) + " dB" : "--"}
                      <br />
                      <b>at angle:</b> {antennaPatternStats ? antennaPatternStats.indexMinPF + "\u00B0" : "--"}
                    </p>
                  </div>
                }
              </div>
            </div>
            <div id="antennaPatternInfo" className="collapse mt-2">
              <div className="card card-body py-2 mb-2 mx-2">
                <p className="form-text mb-1">Click 'Render' to generate the antenna pattern for the current configuration.</p>
              </div>
            </div>


          </div>

          {/* RENDER OPTIONS AND PARAMETERS */}
          <div className="col-12 col-md-6">

            <div className="">

              {/* IMPORT CONFIG FILE FORM */}
              <div className="form-group mb-3">
                <div id="fileImportForm" className="form-group">
                  <div className="input-group">
                    <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#fileUploadInfo">
                      <InfoIcon />
                    </button>
                    <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>File Upload</b></span>
                    <input className="form-control" type="file" id="formFile" accept="application/json" onChange={handleFileUpload} />
                    <button
                      className="btn btn-primary align-self-center"
                      id="importButton"
                      type="submit"
                      form="fileImportForm"
                      value="Render"
                      onClick={() => {
                        handleFileRender(fileContent)
                        console.log("file upload", fileName, watch())
                      }}>
                      Render
                    </button>
                  </div>
                  <div id="fileUploadInfo" className="collapse mt-2">
                    <div className="card card-body py-2 mb-2 mx-2">
                      <p className="form-text mb-1">Upload cell configuration file (.json)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INPUT DIRECTION LOOKUP TABLE FORM */}
              <div className="form-group mb-3">
                <div id="lookupTableForm" className="form-group">
                  <div className="input-group">
                    <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#lookupTableInfo">
                      <InfoIcon />
                    </button>
                    <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>Table Lookup</b></span>
                    <select
                      className="form-select"
                      id="lookupTableForm"
                      onChange={e => {
                        setLookupTableAngle(Number(e.target.value));
                      }}
                      defaultValue={lookupTableAngle}
                      disabled={isFormDisabled}>
                      {angleOptions.map((val) => (
                        <option key={val} value={val}>{val}&deg;</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary align-self-center"
                      id="lookupTableButton"
                      type="submit"
                      form="lookupTableForm"
                      value="Render"
                      onClick={() => {
                        // console.log("table lookup\n", lookupTableAngle)
                        getDataFromAngle(lookupTableAngle)
                        console.log("check", getValues())
                        setIsAntennaPatternRequested(true)
                      }}>
                      Render
                    </button>
                  </div>
                  <div id="lookupTableInfo" className="collapse mt-2">
                    <div className="card card-body py-2 mb-2 mx-2">
                      <p className="form-text mb-1">Input angle direction.</p>
                      <p className="form-text mb-1">Click 'Render' to display cell configuration for the angle.</p>
                    </div>
                  </div>
                </div>
              </div>



            </div>

            <hr className="my-12" style={{ margin: "2rem 5rem" }} />

            <div className="col-10">
              {/* <div className="container gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}> */}

              {/* SELECT ARRAY SIZE */}
              <div id="arrSizeForm" className="form-group mb-3">
                <div className="input-group">
                  <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#arraySizeInfo" aria-expanded="false" aria-controls="lookupTableInfo">
                    <InfoIcon />
                  </button>
                  <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>Array Size</b></span>
                  <select
                    className="form-select"
                    id="arrSizeForm"
                    {...register("arrayDimension")}
                    onChange={e => {
                      setArrSize(Number(e.target.value));
                      setValue("arrayDimension", Number(e.target.value))
                    }}
                    defaultValue={arrSize}
                    disabled={isFormDisabled}>
                    {dimOptions.map((val) => (
                      <option key={val} value={val}>{val}x{val}</option>
                    ))}
                  </select>
                </div>
                <div id="arraySizeInfo" className="collapse mt-2">
                  <div className="card card-body py-2 mb-2 mx-2">
                    <p className="form-text mb-1">Select dimension of cell array.</p>
                  </div>
                </div>
              </div>

              {/* SELECT BITNESS */}
              <div id="bitnessForm" className="form-group mb-3">
                <div className="input-group">
                  <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#bitnessInfo">
                    <InfoIcon />
                  </button>
                  <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>Bitness</b></span>
                  <select
                    className="form-select"
                    id="bitnessForm"
                    {...register("bitness")}
                    onChange={e => {
                      setBitness(Number(e.target.value));
                      setValue("bitness", Number(e.target.value))
                    }}
                    defaultValue={bitness}
                    disabled={isFormDisabled}>
                    <option value={1}>1-bit</option>
                    <option value={2}>2-bit</option>
                  </select>
                </div>
                <div id="bitnessInfo" className="collapse mt-2">
                  <div className="card card-body py-2 mb-2 mx-2">
                    <p className="form-text mb-1">Select 1-bit or 2-bit cell states.</p>
                  </div>
                </div>
              </div>

              {/* SELECT FREQUENCY */}
              <div id="frequencyForm" className="form-group mb-3">
                <div className="input-group">
                  <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#frequencyInfo">
                    <InfoIcon />
                  </button>
                  <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>Frequency</b></span>
                  <input
                    className={`form-control ${errors.frequency ? "is-invalid" : ""}`}
                    id="frequencyForm"
                    type="number"
                    step="any"
                    min={0}
                    required
                    {...register("frequency")}
                    defaultValue={50}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setValue(("frequency") as any, e.target.value)
                    }}
                    disabled={isFormDisabled} />
                  <span className="input-group-text py-0">Hz</span>
                </div>
                <div id="frequencyInfo" className="collapse mt-2">
                  <div className="card card-body py-2 mb-2 mx-2">
                    <p className="form-text mb-1">Select 1-bit or 2-bit cell states.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <br style={{ lineHeight: 1 }} />

      {/* TILED ARRAY */}
      <div style={{ display: "flex", alignItems: "center", overflowX: "auto", whiteSpace: "nowrap" }}>
        <table key={cellArrayKey} id="cellArrayDisplay" className="table table-borderless mx-auto" style={{ width: "min-content" }}>
          <thead>
            <tr>
              <th key={"blank"} scope="col"></th>
              {dmuxDimArr.map((val) => (
                <th key={val} scope="col">
                  <button className="btn btn-light" type="button" data-bs-toggle="collapse" data-bs-target="#columnConfig" style={{ width: "100%" }}>
                    <b>{val}</b>
                  </button>
                  <div className="collapse card" id="columnConfig">
                    <div className="card-header">
                      <p className="float-start m-0">Column {val}</p>

                      <div className="form-check form-switch float-end m-0">

                        {/* CYCLESTATE (https://stackoverflow.com/questions/33455204/quad-state-checkbox) */}
                        {bitness === 1 &&
                          <fieldset className="cyclestate" id={"col_" + String(val)}>
                            <input
                              id={"s0_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="0"
                              disabled={isFormDisabled}
                              defaultChecked
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn cell" + styleCyclestateCell("s0_col_" + String(val), 0, val)}
                              htmlFor={"s0_col_" + String(val)}><b>s0</b>
                            </label>
                            <input
                              id={"s1_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="1"
                              disabled={isFormDisabled}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s1_col_" + String(val), 0, val)}
                              htmlFor={"s1_col_" + String(val)}><b>s1</b>
                            </label>
                          </fieldset>
                        }
                        {bitness === 2 &&
                          <fieldset className="cyclestate" id={"col_" + String(val)}>
                            <input
                              id={"s0_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="0"
                              disabled={isFormDisabled}
                              defaultChecked
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn cell" + styleCyclestateCell("s0_col_" + String(val), 0, val)}
                              htmlFor={"s0_col_" + String(val)}><b>s00</b>
                            </label>
                            <input
                              id={"s1_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="1"
                              disabled={isFormDisabled}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s1_col_" + String(val), 0, val)}
                              htmlFor={"s1_col_" + String(val)}><b>s01</b>
                            </label>
                            <input
                              id={"s2_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="2"
                              disabled={isFormDisabled}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s2_col_" + String(val), 0, val)}
                              htmlFor={"s2_col_" + String(val)}><b>s10</b>
                            </label>
                            <input
                              id={"s3_col_" + String(val)}
                              className="form-check-input btn-check"
                              type="radio"
                              {...register(("columns.col_" + String(val) + ".state") as any)}
                              value="3"
                              disabled={isFormDisabled}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.cell_" + String(i * arrSize + val) + ".state") as any, e.target.value)
                                }
                              }} />
                            <label
                              className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s3_col_" + String(val), 0, val)}
                              htmlFor={"s3_col_" + String(val)}><b>s11</b>
                            </label>
                          </fieldset>
                        }

                      </div>
                    </div>
                    <div className="card-body pb-0">

                      {/* VOLTAGE PEAK TO PEAK */}
                      <div className="input-group has-validation mb-3">
                        <span className="input-group-text py-0"><b>Vpp</b></span>
                        <input
                          className={`form-control form-control-sm has-validation`}
                          id={"col_" + String(val) + "_negVoltage"}
                          type="number"
                          step="any"
                          min={-10}
                          max={10}
                          defaultValue={""}
                          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            for (let i = 0; i < arrSize; i++) {
                              setValue(("configuration.cell_" + String(i * arrSize + val) + ".negVoltage") as any, e.target.value)
                            }
                          }}
                          disabled={isFormDisabled} />
                        <span className="input-group-text py-0">to</span>
                        <input
                          className={`form-control form-control-sm has-validation`}
                          id={"col_" + String(val) + "_posVoltage"}
                          type="number"
                          step="any"
                          min={-10}
                          max={10}
                          defaultValue={""}
                          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            for (let i = 0; i < arrSize; i++) {
                              setValue(("configuration.cell_" + String(i * arrSize + val) + ".posVoltage") as any, e.target.value)
                            }
                          }}
                          disabled={isFormDisabled} />
                        <span className="input-group-text py-0">V</span>
                      </div>

                      {/* DUTY CYCLE */}
                      <div className="input-group has-validation mb-3">
                        <span className="input-group-text py-0"><b>Duty Cycle</b></span>
                        <input
                          className={`form-control form-control-sm has-validation`}
                          id={"col_" + String(val) + "_dutyCycle"}
                          type="number"
                          step="any"
                          min={0}
                          max={100}
                          defaultValue={""}
                          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            for (let i = 0; i < arrSize; i++) {
                              setValue(("configuration.cell_" + String(i * arrSize + val) + ".dutyCycle") as any, e.target.value)
                            }
                          }}
                          disabled={isFormDisabled} />
                        <span className="input-group-text py-0">%</span>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dmuxDimArr.map((rowVal) => (
              <tr key={"tr" + String(rowVal)} >
                <th key={"th" + String(rowVal)} scope="row">{alphabet[rowVal]}</th>
                {dmuxDimArr.map((colVal) => (
                  <td key={"td" + String(rowVal) + String(colVal)} >
                    <div className="col text-start">
                      <div className="card border-dark" style={{ minWidth: 250 + "px", maxWidth: 250 + "px" }}>
                        <div className="card-header" style={styleActuatedCellCard("card-header", rowVal, colVal)}>
                          <p className="float-start m-0"><b>#{String(rowVal * arrSize + colVal)} </b></p>
                          <div className="form-check form-switch float-end m-0">

                            {/* CYCLESTATE (https://stackoverflow.com/questions/33455204/quad-state-checkbox) */}
                            {bitness === 1 &&
                              <fieldset className="cyclestate" id={"cell_" + String(rowVal * arrSize + colVal)}>
                                <input
                                  id={"s0_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="0"
                                  disabled={isFormDisabled}
                                  defaultChecked />
                                <label
                                  className={"form-check-label btn cell" + styleCyclestateCell("s0_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s0_cell_" + String(rowVal * arrSize + colVal)}><b>s0</b>
                                </label>
                                <input
                                  id={"s1_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="1"
                                  disabled={isFormDisabled} />
                                <label
                                  className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s1_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s1_cell_" + String(rowVal * arrSize + colVal)}><b>s1</b>
                                </label>
                              </fieldset>
                            }
                            {bitness === 2 &&
                              <fieldset className="cyclestate" id={"cell_" + String(rowVal * arrSize + colVal)}>
                                <input
                                  id={"s0_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="0"
                                  disabled={isFormDisabled}
                                  defaultChecked />
                                <label
                                  className={"form-check-label btn cell" + styleCyclestateCell("s0_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s0_cell_" + String(rowVal * arrSize + colVal)}><b>s00</b>
                                </label>
                                <input
                                  id={"s1_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="1"
                                  disabled={isFormDisabled} />
                                <label
                                  className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s1_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s1_cell_" + String(rowVal * arrSize + colVal)}><b>s01</b>
                                </label>
                                <input
                                  id={"s2_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="2"
                                  disabled={isFormDisabled} />
                                <label
                                  className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s2_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s2_cell_" + String(rowVal * arrSize + colVal)}><b>s10</b>
                                </label>
                                <input
                                  id={"s3_cell_" + String(rowVal * arrSize + colVal)}
                                  className="form-check-input btn-check"
                                  type="radio"
                                  {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".state") as any)}
                                  value="3"
                                  disabled={isFormDisabled} />
                                <label
                                  className={"form-check-label btn btn-primary cell" + styleCyclestateCell("s3_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)}
                                  htmlFor={"s3_cell_" + String(rowVal * arrSize + colVal)}><b>s11</b>
                                </label>
                              </fieldset>
                            }
                          </div>
                        </div>
                        <div className="card-body pb-0" style={styleActuatedCellCard("card-body", rowVal, colVal)}>

                          {/* VOLTAGE PEAK TO PEAK */}
                          <div className="input-group has-validation mb-3">
                            <span className="input-group-text py-0"><b>Vpp</b></span>
                            <input
                              className={`form-control form-control-sm has-validation`}
                              id={"cell_" + String(rowVal * arrSize + colVal) + "_negVoltage"}
                              type="number"
                              step="any"
                              required
                              min={-10}
                              max={10}
                              defaultValue={-10}
                              {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".negVoltage") as any, voltageError)}
                              disabled={isFormDisabled} />
                            <span className="input-group-text py-0">to</span>
                            <input
                              className={`form-control form-control-sm has-validation`}
                              id={"cell_" + String(rowVal * arrSize + colVal) + "_posVoltage"}
                              type="number"
                              step="any"
                              required
                              min={-10}
                              max={10}
                              defaultValue={10}
                              {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".posVoltage") as any, voltageError)}
                              disabled={isFormDisabled} />
                            <span className="input-group-text py-0">V</span>
                          </div>

                          {/* DUTY CYCLE */}
                          <div className="input-group has-validation mb-3">
                            <span className="input-group-text py-0"><b>Duty Cycle</b></span>
                            <input
                              // className={`form-control form-control-sm  ${errors.configuration.cell_String(rowVal * arrSize + colVal).dutyCycle ? "is-invalid" : ""}`}
                              // className={`form-control form-control-sm has-validation ${getFieldState("configuration.cell_" + String(rowVal * arrSize + colVal) + ".dutyCycle" as any).error ? "is-invalid" : ""}`}
                              className={`form-control form-control-sm has-validation`}
                              id={"cell_" + String(rowVal * arrSize + colVal) + "_dutyCycle"}
                              type="number"
                              step="any"
                              defaultValue={50}
                              required
                              min={0}
                              max={100}
                              {...register(("configuration.cell_" + String(rowVal * arrSize + colVal) + ".dutyCycle") as any, dutyCycleError)}
                              disabled={isFormDisabled} />
                            <span className="input-group-text py-0">%</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default ConfigurationForm;
