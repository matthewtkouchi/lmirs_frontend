import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { DAQInputs } from "../utils/DAQ";
import getTS from "../utils/getTS";

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DAQInputs>();
  const onSubmit: SubmitHandler<DAQInputs> = (data) => {
    let eafis = data; // eafis stands for eafis
    eafis["timestamp"] = getTS();
    handleSubmitData(eafis);
    console.log(eafis)
  };
  useEffect(() => {
    reset();
  }, [resetButton]);

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

  return (
    <form id="configForm" name="configForm" onSubmit={handleSubmit(onSubmit)}>
      <div className="row justify-content-start">
        <div className="col col-12 col-md-5 mt-3 px-md-0">
          <h1>Cell Configuration</h1>
          <table className="table table-borderless">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">0</th>
                <th scope="col">1</th>
                <th scope="col">2</th>
                <th scope="col">3</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">A</th>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="0"
                    {...register("dmuxOutputNum.0")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["0" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="0"
                  >
                    0
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="1"
                    {...register("dmuxOutputNum.1")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["1" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="1"
                  >
                    1
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="2"
                    {...register("dmuxOutputNum.2")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["2" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="2"
                  >
                    2
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="3"
                    {...register("dmuxOutputNum.3")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["3" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="3"
                  >
                    3
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">B</th>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="4"
                    {...register("dmuxOutputNum.4")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["4" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="4"
                  >
                    4
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="5"
                    {...register("dmuxOutputNum.5")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["5" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="5"
                  >
                    5
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="6"
                    {...register("dmuxOutputNum.6")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["6" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="6"
                  >
                    6
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="7"
                    {...register("dmuxOutputNum.7")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["7" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="7"
                  >
                    7
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">C</th>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="8"
                    {...register("dmuxOutputNum.8")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["8" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="8"
                  >
                    8
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="9"
                    {...register("dmuxOutputNum.9")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["9" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="9"
                  >
                    9
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="10"
                    {...register("dmuxOutputNum.10")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["10" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="10"
                  >
                    10
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="11"
                    {...register("dmuxOutputNum.11")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["11" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="11"
                  >
                    11
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">D</th>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="12"
                    {...register("dmuxOutputNum.12")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["12" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="12"
                  >
                    12
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    // defaultValue={false}
                    id="13"
                    {...register("dmuxOutputNum.13")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["13" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="13"
                  >
                    13
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="14"
                    {...register("dmuxOutputNum.14")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["14" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="14"
                  >
                    14
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="btn btn-check"
                    id="15"
                    {...register("dmuxOutputNum.15")}
                    disabled={isFormDisabled}
                  />
                  <label
                    className={
                      actuatedCells["15" as keyof typeof actuatedCells]
                        ? "btn cell btn-outline-success"
                        : "btn cell btn-outline-primary"
                    }
                    htmlFor="15"
                  >
                    15
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="form-text ps-3">Select cells to activate.</p>
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
                    className={`form-control form-control-sm ${
                      errors.negVoltage ? "is-invalid" : ""
                    }`}
                    id="negVoltageForm"
                    type="number"
                    step="any"
                    // placeholder="-10"
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
                    className={`form-control form-control-sm ${
                      errors.posVoltage ? "is-invalid" : ""
                    }`}
                    id="posVoltageForm"
                    type="number"
                    step="any"
                    // placeholder="10"
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
                    className={`form-control form-control-sm  ${
                      errors.frequency ? "is-invalid" : ""
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
                    className={`form-control form-control-sm  ${
                      errors.dutyCycle ? "is-invalid" : ""
                    }`}
                    id="dutyCycleForm"
                    type="number"
                    step="any"
                    // placeholder="50"
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
                  className={`form-control form-control-sm ${
                    errors.defaultDuration ? "is-invalid" : ""
                  }`}
                  id="defaultDurationForm"
                  type="number"
                  step="any"
                  // placeholder="60"
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
