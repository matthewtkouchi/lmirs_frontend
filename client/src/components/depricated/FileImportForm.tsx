import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { DAQInputs, alphabet } from "../../utils/DAQ";
import getTS from "../../utils/getTS";
import * as fs from 'fs';
import { text } from "@fortawesome/fontawesome-svg-core";

const ConfigurationForm = ({
  resetButton,
  handleSubmitData,
  isFormDisabled,
  actuatedCells,
}: {
  resetButton: boolean;
  handleSubmitData: (data: object) => void;
  isFormDisabled: boolean;
  actuatedCells: object;
}) => {

  // Init form input using RHF
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
    // console.log("form_data", form_data);
  };

  // Reset form values when reset button is pressed
  useEffect(() => {
    reset();
  }, [resetButton]);

  // Input Validation 
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

  // const words = fs.readFileSync('./words.txt', 'utf-8');
  const handleFileSubmit = async (e : React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files[0].type != "text/plain") return;
      console.log(e.target.files[0])
      // setFileText(fs.readFileSync( 'utf-8');)
      // console.log(e.target.files.item)
  }

  const [fileText, setFileText] = useState("")

  return (
    <form id="configForm" name="configForm" onSubmit={handleSubmit(onSubmit)}>
      <div className="row justify-content-start">
        <div className="col col-12 col-md-5 mt-3 px-md-0">
          <h1>Cell Configuration</h1>
          <div id="fileForm" className="form-group">
            <div className="input-group has-validation">
              <div className="mb-3">
                <label htmlFor="formFile" className="form-label">Upload cell configuration text file.</label>
                <input className="form-control" type="file" id="formFile" onChange={handleFileSubmit}/>
              </div>
            </div>
          </div>
          <div className="form-group">
            <textarea
              // readOnly
              className="form-control"
              id="LogOutputTextArea"
              rows={15}
              value={fileText}
            ></textarea>
          </div>
        </div>

        <div className="col col-12 col-md-6 mt-3 offset-md-1 ps-6 pe-md-0">
          <h1>Parameters</h1>
          <div className="row">
            <div className="col">
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
                  {/* <p>{errors.negVoltage?.message}</p> */}
                  <div className="invalid-feedback">
                    {errors.negVoltage?.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
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
            <div className="col">
              <div className="form-group">
                <label className="col-form-label-sm" htmlFor="frequencyForm">
                  Frequency:
                </label>
                <div className="input-group has-validation">
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
            <div className="col">
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
          <p className="form-text">
            Voltages must be between -10 and 10. <br />
            Duty Cycle must be an integer percentage. <br />
            Frequency and Duration must be integers.
            <br />
          </p>
        </div>
      </div>
    </form>
  );
};

export default ConfigurationForm;
