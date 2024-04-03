import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { ConfigurationType } from "../utils/actuation";
import { getTS, alphabet } from "../utils/general";
import { ReactComponent as InfoIcon } from "../assets/info-lg.svg"
import lookupTable from "../utils/LookupTable.json"

const ConfigurationForm = ({ isResetButtonPressed, handleMultiArrayFormData, currentFormData, isFormDisabled, actuatedCells }: { isResetButtonPressed: boolean, handleMultiArrayFormData: (data: object) => void, currentFormData: object, isFormDisabled: boolean, actuatedCells: object }) => {

  // Initialize form input using React-Hook-Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ConfigurationType>();

  // Collect form data as JSON string upon submit
  const onSubmit: SubmitHandler<ConfigurationType> = (data) => {
    let submitFormData = data;
    submitFormData["timestamp"] = getTS();
    handleMultiArrayFormData(submitFormData);
    console.log("formData", submitFormData);
  };

  // Reset form values when reset button is pressed
  useEffect(() => {
    reset();
    setMultiArrSize(4);
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
  const defaultError = {
    required: "Cannot be blank.",
    min: { value: 0, message: "Cannot be negative." },
    pattern: { value: /^(0|[1-9]\d*)?$/, message: "Must be integer." },
  };

  // Initialize parameters for adjusting bitness
  const [bitness, setBitness] = useState<number>(1);

  // Initialize parameters for adjusting array size
  const [multiArrSize, setMultiArrSize] = useState<number>(3); // set dimension for array based on user input, default is 4x4
  const [multiDimArr, setMultiDimArr] = useState([...Array(multiArrSize).keys()]);

  const [arrSize, setArrSize] = useState<number>(4); // set dimension for array based on user input, default is 4x4
  const [cellArrayKey, setCellArrayKey] = useState<number>(69420); // set arbitrary key for the array's HTML element. Changing the key will cause re-render
  const [dmuxDimArr, setDmuxDimArr] = useState([...Array(arrSize).keys()]);
  const dimOptions = Array.from({ length: 16 }, (_, i) => i + 1) // used with map() to draw the list of array dimension options for the user to select

  // When user changes the array size
  useEffect(() => {
    setDmuxDimArr([...Array(arrSize).keys()]); // update dmuxDimArr, which is used to draw the cell array 
    setCellArrayKey(Math.random()) // cycle to a new key for #cellArrayDisplay, which re-renders the element
  }, [arrSize]);

  // When user changes the array size
  useEffect(() => {
    setMultiDimArr([...Array(multiArrSize).keys()]); // update dmuxDimArr, which is used to draw the cell array 
    setCellArrayKey(Math.random()) // cycle to a new key for #cellArrayDisplay, which re-renders the element
  }, [multiArrSize]);

  // Set styling for cells based on actuation (highlight green) and FormDisabled (submit button pressed)
  const styleCyclestateCell = (elementID: string, _rowVal: number, _colVal: number) => {
    let cellElement = document.getElementById(elementID) as HTMLInputElement // grab input element by ID
    // let actuateClassName = actuatedCells[String(_rowVal * arrSize + _colVal) as keyof typeof actuatedCells] ? "btn-success" : "" // highlight green when cell is actuated by python script
    let isFormDisabledClassName = isFormDisabled && !cellElement.checked ? "opacity-0" : "" // when form is disabled (when submit button pressed), hide the states that aren't checked
    // return " " + isFormDisabledClassName + " " + actuateClassName + " " // return these conditional classNames
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
    return {} // return these conditional classNames
  }

  // Read File
  const [fileName, setFileName] = useState<string>("") // The name of the file
  const [fileContent, setFileContent] = useState<ConfigurationType>() // The contents of the file
  const [validatedFileInput, setValidatedFileInput] = useState<string[]>([]) // the file contents as array

  // Process the file into the fileName and fileContent states
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type == "application/json") {

      const file = e.target.files[0];
      const reader = new FileReader();

      setTimeout(() => reader.readAsText(file, 'UTF-8'), 100)
      reader.onload = () => {
        setFileName(file.name)
        setFileContent(JSON.parse(reader.result as string))
      };

      reader.onerror = () => {
        console.log('[ERROR]', reader.error)
      }
    } else {
      console.log("[ERROR] Invalid File Type (not .json).")
      return;
    }
  }

  const handleFileRender = (configData: ConfigurationType | undefined) => {
    if (configData) {
      setArrSize(Number(configData.arrayDimension))
      setValue("arrayDimension", configData.arrayDimension)

      setBitness(Number(configData.bitness))
      setValue("bitness", configData.bitness)

      setTimeout(() => setValue("columns", configData.columns), 100)
      setTimeout(() => setValue("configuration", configData.configuration), 100)
    }
  }

  // Trigger update Form when file is valided.
  // This is required since, with useState, we can't update everything in the same function
  useEffect(() => {
    if (validatedFileInput.length != 0) {
      updateFormWithFile()
    }
  }, [validatedFileInput])

  // Update form with file..
  const updateFormWithFile = () => {
    console.log(fileName, "\n", fileContent, validatedFileInput)

    setArrSize(Math.sqrt(validatedFileInput.length));
    setValue("arrayDimension", Math.sqrt(validatedFileInput.length));

    // Delay is used to allow React-Hook-Form to properly register values and display values. I can't be bothered.
    // Maybe need to use another useEffect? 
    setTimeout(() => setValue("configuration", validatedFileInput), 100)
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
  useEffect(() => {
    if (validatedFileInput.length != 0) {
      updateFormWithFile()
    }
  }, [lookupTableAngle])



  return (

    <form id="configForm" name="configForm" onSubmit={handleSubmit(onSubmit)} onChange={()=>handleMultiArrayFormData(getValues())}>

      <div className="container gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

        {/* INPUT DIRECTION LOOKUP TABLE FORM */}
        <div className="col-6 form-group">
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
                  <option value={val}>{val}&deg;</option>
                ))}
              </select>
              <button
                className="btn btn-primary align-self-center"
                id="lookupTableButton"
                type="submit"
                form="lookupTableForm"
                value="Render"
                onClick={() => {
                  // console.log("check", getValues())
                  // console.log("here\n", lookupTableAngle)
                  // console.log(lookupTableJSON[0])
                }}>
                Render
              </button>
            </div>
            <div id="lookupTableInfo" className="collapse">
              <div className="card card-body py-2 mb-2 mx-2">
                <p className="form-text mb-1">Input angle direction.</p>
                <p className="form-text mb-1">Click 'Render' to display cell configuration for the angle.</p>
              </div>
            </div>
          </div>
        </div>

        {/* IMPORT CONFIG FILE FORM */}
        <div className="col-6 form-group">
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
                  console.log("here\n", fileContent)
                  // handleFileValidation()
                  handleFileRender(fileContent)
                }}>
                Render
              </button>
            </div>
            <div id="fileUploadInfo" className="collapse">
              <div className="card card-body py-2 mb-2 mx-2">
                <p className="form-text mb-1">Upload cell configuration file (.json)</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <hr className="my-12" style={{ marginBottom: "2rem", marginTop: "2rem", marginLeft: "8rem", marginRight: "8rem" }} />

      <div className="container gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

        {/* SELECT ARRAY SIZE */}
        <div id="arrSizeForm" className="col-4 form-group">
          <div className="input-group mb-3">
            <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#arraySizeInfo" aria-expanded="false" aria-controls="lookupTableInfo">
              <InfoIcon />
            </button>
            <span className="input-group-text py-0" style={{ fontSize: "medium" }}><b>Multi Array</b></span>
            <select
              className="form-select"
              id="arrSizeForm"
              {...register("multiArrayDimension")}
              onChange={e => {
                setMultiArrSize(Number(e.target.value));
              }}
              defaultValue={multiArrSize}
              disabled={isFormDisabled}>
              {dimOptions.map((val) => (
                <option value={val}>{val}x{val}</option>
              ))}
            </select>
          </div>
          <div id="arraySizeInfo" className="collapse">
            <div className="card card-body py-2 mb-2 mx-2">
              <p className="form-text mb-1">Select dimension of cell array.</p>
            </div>
          </div>
        </div>

      </div>

      {/* TILED ARRAY */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <table key={cellArrayKey} id="cellArrayDisplay" className="table table-borderless" style={{ width: "min-content" }}>
          <thead>
            <tr>
              <th scope="col"></th>
              {multiDimArr.map((val) => (
                <th scope="col">
                  <p className="m-0">{val}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {multiDimArr.map((rowVal) => (
              <tr>
                <th scope="row">{alphabet[rowVal]}</th>
                {multiDimArr.map((colVal) => (
                  <td>
                    <div className="col text-start">
                      <div className="card border-dark" style={{ minWidth: 200 + "px", maxWidth: 200 + "px", minHeight: 200 + "px", maxHeight: 200 + "px" }}>
                        <div className="card-header" style={styleActuatedCellCard("card-header", rowVal, colVal)}>
                          <p className="float-start m-0"><b>#{String(rowVal * arrSize + colVal)} </b></p>
                          <div className="form-check form-switch float-end m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              disabled={isFormDisabled}
                              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                console.log("hello", e.target.checked)
                                for (let i = 0; i < arrSize; i++) {
                                  setValue(("configuration.array_" + String(rowVal * arrSize + colVal) + ".state") as any, e.target.value)
                                }
                              }}
                              style={{ "width": "3rem", "height": "1.25rem" }} />
                          </div>

                        </div>
                        <div className="card-body pb-0" style={styleActuatedCellCard("card-body", rowVal, colVal)}>
                          <table className="table mb-0" >
                            <tbody>
                              {dmuxDimArr.map((mrv) => (
                                <tr>
                                  {dmuxDimArr.map((mrc) => (
                                    <button className={`btn btn-outline-secondary ${mrv*arrSize+mrc < 3 ? "active" : ""}`} style={{padding:"8px 12px", margin: "5px 5px"}}>
                                      
                                    </button>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <span className="form-control-sm" style={{ display: "flex", justifyContent: "center" }}><i>4x4 array</i></span>
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
