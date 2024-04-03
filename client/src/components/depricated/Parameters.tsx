import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  timestamp: string; // generated on submit
  negVoltage: number;
  posVoltage: number;
  frequency: number;
  dutyCycle: number;
  defaultDuration: number;
  dmuxOutputNum: object; // from cell array form
};

const Parameters = ({
  resetButton,
  submitButton,
}: {
  resetButton: boolean;
  submitButton: boolean;
}) => {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    let eafis = data;
    eafis["timestamp"] = "shit";
    console.log(eafis);
  };

  useEffect(() => {
    reset();
  }, [resetButton]);
  // useEffect(() => {
  //   console.log("fuck")
  //   document.parameterForm.submit();
  //   // handleSubmit(onSubmit);
  // }, [submitButton]);

  // console.log(watch("posVoltage"));

  return (
    // <form id="sameForm" name="sameForm" onSubmit={handleSubmit(onSubmit)}>
    <>
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label className="col-form-label-sm" htmlFor="negVoltageForm">
              Negative Voltage:
            </label>
            <div className="input-group mb-3">
              <input
                className="form-control form-control-sm"
                id="negVoltageForm"
                type="number"
                step="any"
                placeholder="-10"
                {...register("negVoltage")}
              />
              <span className="input-group-text" id="basic-addon1">
                V
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="form-group">
            <label className="col-form-label-sm" htmlFor="posVoltageForm">
              Positive Voltage:
            </label>
            <div className="input-group mb-3">
              <input
                className="form-control form-control-sm"
                id="posVoltageForm"
                type="number"
                step="any"
                placeholder="10"
                {...register("posVoltage")}
              />
              <span className="input-group-text" id="basic-addon1">
                V
              </span>
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
            <div className="input-group">
              <input
                className="form-control form-control-sm"
                id="frequencyForm"
                type="number"
                placeholder="50"
                {...register("frequency")}
              />
              <span className="input-group-text" id="basic-addon1">
                Hz
              </span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label className="col-form-label-sm" htmlFor="dutyCycleForm">
              Duty Cycle:
            </label>
            <div className="input-group mb-3">
              <input
                className="form-control form-control-sm"
                id="dutyCycleForm"
                type="number"
                placeholder="50"
                {...register("dutyCycle")}
              />
              <span className="input-group-text" id="basic-addon1">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="form-group">
          <label className="col-form-label-sm" htmlFor="defaultDurationForm">
            Duration:
          </label>
          <div className="input-group mb-3">
            <input
              className="form-control form-control-sm"
              id="defaultDurationForm"
              type="number"
              placeholder="60"
              {...register("defaultDuration")}
            />
            <span className="input-group-text" id="basic-addon1">
              seconds
            </span>
          </div>
        </div>
      </div>
      <p className="form-text">
        Voltages must be between -10 and 10. <br />
        Freq, Duty Cycle, and Duration must be integers.{" "}
      </p>
    </>
    // </form>
  );
};

export default Parameters;
