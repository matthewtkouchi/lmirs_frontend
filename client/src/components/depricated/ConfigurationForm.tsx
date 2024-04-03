import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { DAQInputs, alphabet } from "../../utils/DAQ";
import getTS from "../../utils/getTS";
import { ReactComponent as InfoIcon } from "../assets/info-lg.svg"
import lookupTable from "../../utils/lookupTable.json"

const ConfigurationForm = ({ resetButton, handleSubmitData, isFormDisabled, actuatedCells }: { resetButton: boolean, handleSubmitData: (data: object) => void, isFormDisabled: boolean, actuatedCells: object }) => {

  // Initialize form input using React-Hook-Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DAQInputs>();

  // Collect form data as JSON string upon submit
  const onSubmit: SubmitHandler<DAQInputs> = (data) => {
    let form_data = data;
    form_data["timestamp"] = getTS();
    handleSubmitData(form_data);
    console.log("form_data", form_data);
  };

  // Reset form values when reset button is pressed
  useEffect(() => {
    reset();
    setArrSize(4);
  }, [resetButton]);

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
  const defaultError = {
    required: "Cannot be blank.",
    min: { value: 0, message: "Cannot be negative." },
    pattern: { value: /^(0|[1-9]\d*)?$/, message: "Must be integer." },
  };

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

  // Set styling for cells based on actuation (highlight green) and FormDisabled (submit button pressed)
  const styleCell = (elementID: string, _rowVal: number, _colVal: number) => {
    let cellElement = document.getElementById(elementID) as HTMLInputElement // grab input element by ID
    let actuateClassName = actuatedCells[String(_rowVal * arrSize + _colVal) as keyof typeof actuatedCells] ? "btn-success" : "" // highlight green when cell is actuated by python script
    let isFormDisabledClassName = isFormDisabled && !cellElement.checked ? "opacity-0" : "" // when form is disabled (when submit button pressed), hide the states that aren't checked
    return " " + isFormDisabledClassName + " " + actuateClassName + " " // return these conditional classNames
  }

  // Set styling for sections based on array size 
  const styleSectionGrids = (sectionName: string) => {

    const arrSizeThresOne = 6  // 0-5
    const arrSizeThresTwo = 11 // 6-10
    const arrSizeThresThree = 12 // 11-11
    if (sectionName === "File Upload" || sectionName === "Lookup Table") {
      if (arrSize < arrSizeThresOne) return "col col-12 col-lg-6 px-md-0 mt-3"
      else if (arrSize > arrSizeThresOne && arrSize < arrSizeThresTwo) return "col col-12 col-lg-6 mt-3 ps-6"
    }
    if (sectionName === "Cell Configuration") {
      if (arrSize < arrSizeThresOne) return "col col-12 col-md-6 mt-3 px-md-0"
      else if (arrSize >= arrSizeThresOne && arrSize < arrSizeThresTwo) return "col col-12 col-lg-8 mt-3"
      else if (arrSize >= arrSizeThresTwo && arrSize < arrSizeThresThree) return "col col-12 col-xl-8 mt-3"
      else return "col col-12 mt-3"
    }
    if (sectionName === "Parameters") {
      if (arrSize < arrSizeThresOne) return "col col-12 col-md-5 mt-3 ps-6 pe-md-0"
      else if (arrSize >= arrSizeThresOne && arrSize < arrSizeThresTwo) return "col col-12 col-lg-3 mt-3 ps-6"
      else if (arrSize >= arrSizeThresTwo && arrSize < arrSizeThresThree) return "col col-12 col-xl-3 mt-3 ps-6"
      else return "col col-12 mt-3 ps-6"
    }
    if (sectionName === "ParameterFields") {
      if (arrSize < arrSizeThresOne) return "col"
      else if (arrSize >= arrSizeThresOne && arrSize < arrSizeThresTwo) return "col col-lg-12"
      else if (arrSize >= arrSizeThresTwo && arrSize < arrSizeThresThree) return "col col-xl-12"
      else return "col"
    }
  }

  // Read File
  const [fileName, setFileName] = useState<string>("") // The name of the file
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>("") // The contents of the file
  const [validatedFileInput, setValidatedFileInput] = useState<string[]>([]) // the file contents as array

  // Process the file into the fileName and fileContent states
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0].type == "text/plain") {

      const file = e.target.files[0];
      const reader = new FileReader();

      setTimeout(() => reader.readAsText(file, 'UTF-8'), 100)
      reader.onload = () => {
        setFileName(file.name)
        setFileContent(reader.result)
      };

      reader.onerror = () => {
        console.log('[ERROR]', reader.error)
      }
    } else {
      console.log("[ERROR] File is not plaintext.")
      return;
    }
  }

  // Validate the file and show a form error message if improper. 
  const validateReshapeFileInput = () => {
    if (fileContent != null) {

      if (typeof (fileContent) == "string" && fileContent.length > 0) {
        console.log("4", fileContent)
        const preValInput = fileContent.split(/\s+/)
        console.log("preValInput", preValInput)

        if (preValInput.length > 0 && Math.sqrt(preValInput.length) % 1 === 0) {

          if (preValInput.find((num) => parseInt(num) < 4)) {
            setValidatedFileInput(preValInput)

          } else {
            console.log("[ERROR] Contains invalid state. Only supports 1-bit and 2-bit cell configurations.")
            return;
          }
        } else {
          console.log("[ERROR] Array is not a perfect square. (length:" + preValInput.length + ").")
          return;
        }
      } else {
        console.log("[ERROR] File Contents are invalid string.")
        return;
      }
    } else {
      console.log("[ERROR] File Contents are null.")
      return;
    }
  }

  // Trigger update Form when file is valided.
  // This is required since, with useState, we can't update everything in the same function
  useEffect (() => {
    if (validatedFileInput.length != 0) {
      updateFormWithFile()
    }
  }, [validatedFileInput])

  // Update form with file..
  const updateFormWithFile = () => {
    console.log(fileName, "\n", fileContent, validatedFileInput)

    setArrSize(Math.sqrt(validatedFileInput.length));
    setValue("arrSize", Math.sqrt(validatedFileInput.length));

    // Delay is used to allow React-Hook-Form to properly register values and display values. I can't be bothered.
    // Maybe need to use another useEffect? 
    setTimeout(() => setValue("dmuxOutputNum", validatedFileInput), 100)
  }


  // Lookup Table Dropdown
  const [lookupTableAngle, setLookupTableAngle] = useState<number>(0) // Define angles
  const angleOptionsMaxLength = 45
  const angleOptionsIncrement = 5
  const arrayRange = (start: number, stop: number, step: number) =>
    Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

  const angleOptions = arrayRange(-angleOptionsMaxLength, angleOptionsMaxLength, angleOptionsIncrement)

  // const angleOptions = Array.from({ length: 45 }, (_, i) => i + 5) // used with map() to draw the list of array dimension options for the user to select
  const lookupTableJSON = lookupTable 

  // Trigger update Form when lookupTable button is pressed.
  // This is required since, with useState, we can't update everything in the same function
  useEffect (() => {
    if (validatedFileInput.length != 0) {
      updateFormWithFile()
    }
  }, [lookupTableAngle])



  return (

    <form id="configForm" name="configForm" onSubmit={handleSubmit(onSubmit)}>

      {/* INPUT DIRECTION LOOKUP TABLE FORM */}
      <div className="row justify-content-start">
        <div className={styleSectionGrids("Lookup Table")}>
          <div className="d-inline-flex gap-2">
            <h2>Table Lookup</h2>
            <button className="btn btn-secondary align-self-center pt-0 pb-1 px-1 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#lookupTableInfo" aria-expanded="false" aria-controls="lookupTableInfo">
              <InfoIcon />
            </button>
          </div>
          <div id="lookupTableInfo" className="collapse">
            <div className="card card-body py-2 mb-2 mx-2">
              <p className="form-text mb-1">Input angle direction.</p>
              <p className="form-text mb-1">Click 'Render' to display cell configuration for the angle.</p>
            </div>
          </div>

          <div id="lookupTableForm" className="form-group">
            <div className="d-inline-flex gap-2" style={{minWidth: 300+"px"}}>
              <div className="input-group has-validation">
                <div className="mb-3">
                  <select
                    className="form-select mt-3 "
                    style={{minWidth: 300+"px"}}
                    id="lookupTableForm"
                    onChange={e => {
                      setLookupTableAngle(Number(e.target.value));
                    }}
                    defaultValue={lookupTableAngle}
                    disabled={isFormDisabled}>
                    {angleOptions.map((val) => (
                      <option value={val}>{val}&deg;</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary ms-1 my-1 py-1 align-self-center"
                id="lookupTableButton"
                type="submit"
                form="lookupTableForm"
                value="Render"
                onClick={() => {
                  console.log("here\n", lookupTableAngle)
                  // setValidatedFileInput()
                  console.log(lookupTableJSON[0])
                  // validateReshapeFileInput()
                }}>
                Render
              </button>
            </div>
          </div>
        </div>

        {/* IMPORT CONFIG FILE FORM */}
        <div className={styleSectionGrids("File Upload")}>
          <div className="d-inline-flex gap-2">
            <h2>File Upload</h2>
            <button className="btn btn-secondary align-self-center pt-0 pb-1 px-1 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#fileUploadInfo" aria-expanded="false" aria-controls="fileUploadInfo">
              <InfoIcon />
            </button>
          </div>
          <div id="fileUploadInfo" className="collapse">
            <div className="card card-body py-2 mb-2 mx-2">
              <p className="form-text mb-1">Upload cell configuration file (.txt)</p>
            </div>
          </div>
          <div id="fileImportForm" className="form-group">
            <div className="d-inline-flex gap-2">
              <div className="input-group has-validation">
                <div className="mb-3">
                  <input className="form-control mt-3" type="file" id="formFile" accept="text/plain" onChange={handleFileUpload} />
                </div>
              </div>
              <button
                className="btn btn-primary ms-1 my-1 py-1 align-self-center"
                id="importButton"
                type="submit"
                form="fileImportForm"
                value="Upload"
                onClick={() => {
                  console.log("here\n", fileContent)
                  validateReshapeFileInput()
                }}>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
                
      <hr className="my-12" />

      <div className="row justify-content-between">

        {/* CELL CONFIGURATION INPUT FORM */}
        <div className={styleSectionGrids("Cell Configuration")}>
          <div className="d-inline-flex gap-2">
            <h2>Cell Configuration</h2>
            <button className="btn btn-secondary align-self-center pt-0 pb-1 px-1 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#cellConfigurationInfo">
              <InfoIcon />
            </button>
          </div>

          <div id="cellConfigurationInfo" className="collapse">
            <div className="card card-body py-2 mb-2 mx-2">
              <p className="form-text mb-1">1. Use dropdown to select array size.</p>
              <p className="form-text mb-1">2. Select which array cells to actuate.</p>
            </div>
          </div>

          {/* SELECT ARRAY SIZE */}
          <div id="arrSizeForm" className="form-group">
            <div className="input-group has-validation">
              <select
                className="form-select my-3"
                id="arrSizeForm" {...register("arrSize")}
                onChange={e => {
                  setArrSize(Number(e.target.value));
                }}
                defaultValue={arrSize}
                disabled={isFormDisabled}>
                {dimOptions.map((val) => (
                  <option value={val}>{val}x{val}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DISPLAY CELL ARRAY */}
          <table key={cellArrayKey} id="cellArrayDisplay" className="table table-borderless">
            <thead>
              <tr>
                <th scope="col"></th>
                {dmuxDimArr.map((val) => (
                  <th scope="col">{val}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dmuxDimArr.map((rowVal) => (
                <tr>
                  <th scope="row">{alphabet[rowVal]}</th>
                  {dmuxDimArr.map((colVal) => (
                    <td>
                      {/* CYCLESTATE (https://stackoverflow.com/questions/33455204/quad-state-checkbox) */}
                      <fieldset className="cyclestate" id={"cell_" + String(rowVal * arrSize + colVal)}>
                        <input id={"s0_cell_" + String(rowVal * arrSize + colVal)} className="form-check-input btn-check" type="radio" {...register(("dmuxOutputNum." + String(rowVal * arrSize + colVal)) as any)} value="0" disabled={isFormDisabled} defaultChecked />
                        <label className={"form-check-label btn cell" + styleCell("s0_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)} htmlFor={"s0_cell_" + String(rowVal * arrSize + colVal)}>0&deg;</label>
                        <input id={"s1_cell_" + String(rowVal * arrSize + colVal)} className="form-check-input btn-check" type="radio" {...register(("dmuxOutputNum." + String(rowVal * arrSize + colVal)) as any)} value="1" disabled={isFormDisabled} />
                        <label className={"form-check-label btn btn-primary cell" + styleCell("s1_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)} htmlFor={"s1_cell_" + String(rowVal * arrSize + colVal)}>180&deg;</label>
                        {/* <input id={"s2_cell_" + String(rowVal * arrSize + colVal)} className="form-check-input btn-check" type="radio" {...register(("dmuxOutputNum." + String(rowVal * arrSize + colVal)) as any)} value="2" disabled={isFormDisabled} />
                        <label className={"form-check-label btn btn-primary cell" + styleCell("s2_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)} htmlFor={"s2_cell_" + String(rowVal * arrSize + colVal)}>s2</label>
                        <input id={"s3_cell_" + String(rowVal * arrSize + colVal)} className="form-check-input btn-check" type="radio" {...register(("dmuxOutputNum." + String(rowVal * arrSize + colVal)) as any)} value="3" disabled={isFormDisabled} />
                        <label className={"form-check-label btn btn-primary cell" + styleCell("s3_cell_" + String(rowVal * arrSize + colVal), rowVal, colVal)} htmlFor={"s3_cell_" + String(rowVal * arrSize + colVal)}>s3</label> */}
                      </fieldset>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* PARAMETERS INPUT FORM */}
        <div className={styleSectionGrids("Parameters")}>
          <div className="d-inline-flex gap-2">
            <h2>Parameters</h2>
            <button className="btn btn-secondary align-self-center pt-0 pb-1 px-1 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#parametersInfo">
              <InfoIcon />
            </button>
          </div>

          <div className="row">
            <div id="parametersInfo" className="collapse float-start">
              <div className="card card-body py-2 mb-2 mx-2">
                <p className="form-text mb-1">Voltages must be between -10 and 10.</p>
                <p className="form-text mb-1">Duty Cycle must be an integer percentage.  </p>
                <p className="form-text mb-1">Frequency and Duration must be integers.</p>
              </div>
            </div>

            {/* NEGATIVE VOLTAGE */}
            <div className={styleSectionGrids("ParameterFields")}>
              <div className="form-group">
                <label className="col-form-label-sm" htmlFor="negVoltageForm">
                  Negative Voltage:
                </label>
                <div className="input-group has-validation mb-3">
                  <input
                    className={`form-control form-control-sm ${errors.negVoltage ? "is-invalid" : ""
                      }`}
                    id="negVoltageForm"
                    type="number"
                    step="any"
                    defaultValue={-10}
                    {...register("negVoltage", voltageError)}
                    disabled={isFormDisabled}
                  />
                  <span className="input-group-text" id="basic-addon1">
                    V
                  </span>
                  <div className="invalid-feedback">
                    {errors.negVoltage?.message}
                  </div>
                </div>
              </div>
            </div>

            {/* POSITIVE VOLTAGE */}
            <div className={styleSectionGrids("ParameterFields")}>
              <div className="form-group">
                <label className="col-form-label-sm" htmlFor="posVoltageForm">
                  Positive Voltage:
                </label>
                <div className="input-group has-validation mb-3">
                  <input
                    className={`form-control form-control-sm ${errors.posVoltage ? "is-invalid" : ""
                      }`}
                    id="posVoltageForm"
                    type="number"
                    step="any"
                    defaultValue={10}
                    {...register("posVoltage", voltageError)}
                    disabled={isFormDisabled}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    V
                  </span>
                  <div className="invalid-feedback">
                    {errors.posVoltage?.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">

            {/* FREQUENCY */}
            <div className={styleSectionGrids("ParameterFields")}>
              <div className="form-group">
                <label className="col-form-label-sm" htmlFor="frequencyForm">
                  Frequency:
                </label>
                <div className="input-group has-validation mb-3">
                  <input
                    className={`form-control form-control-sm  ${errors.frequency ? "is-invalid" : ""
                      }`}
                    id="frequencyForm"
                    type="number"
                    step="any"
                    // inputmode="decimal"
                    // pattern="[0-9]*"
                    // placeholder="50"
                    defaultValue={50}
                    {...register("frequency", defaultError)}
                    disabled={isFormDisabled}
                  />
                  <span className="input-group-text" id="basic-addon2">
                    Hz
                  </span>
                  <div className="invalid-feedback">
                    {errors.frequency?.message}
                  </div>
                </div>
              </div>
            </div>

            {/* DUTY CYCLE */}
            <div className={styleSectionGrids("ParameterFields")}>
              <div className="form-group">
                <label className="col-form-label-sm" htmlFor="dutyCycleForm">
                  Duty Cycle:
                </label>
                <div className="input-group has-validation mb-3">
                  <input
                    className={`form-control form-control-sm  ${errors.dutyCycle ? "is-invalid" : ""
                      }`}
                    id="dutyCycleForm"
                    type="number"
                    step="any"
                    defaultValue={50}
                    {...register("dutyCycle", dutyCycleError)}
                    disabled={isFormDisabled}
                  />
                  <span className="input-group-text" id="basic-addon1">
                    %
                  </span>
                  <div className="invalid-feedback">
                    {errors.dutyCycle?.message}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DURATION */}
          <div className="row">
            <div className="form-group">
              <label
                className="col-form-label-sm"
                htmlFor="defaultDurationForm"
              >
                Duration:
              </label>
              <div className="input-group has-validation mb-3">
                <input
                  className={`form-control form-control-sm ${errors.defaultDuration ? "is-invalid" : ""
                    }`}
                  id="defaultDurationForm"
                  type="number"
                  step="any"
                  defaultValue={10}
                  {...register("defaultDuration", defaultError)}
                  disabled={isFormDisabled}
                />
                <span className="input-group-text" id="basic-addon1">
                  seconds
                </span>
                <div className="invalid-feedback">
                  {errors.defaultDuration?.message}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
};

export default ConfigurationForm;
