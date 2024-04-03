import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  "0": boolean;
  "1": boolean;
  "2": boolean;
  "3": boolean;
  "4": boolean;
  "5": boolean;
  "6": boolean;
  "7": boolean;
  "8": boolean;
  "9": boolean;
  "10": boolean;
  "11": boolean;
  "12": boolean;
  "13": boolean;
  "14": boolean;
  "15": boolean;
};

const CellArray = ({
  resetButton,
  submitButton,
}: {
  resetButton: boolean;
  submitButton: boolean;
}) => {
  const { register, handleSubmit, reset } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
  };

  useEffect(() => {
    reset();
  }, [resetButton]);
  // useEffect(() => {
  //   reset()
  // }, [resetButton])

  // console.log(watch("posVoltage"));

  return (
    // <form id="sameForm" name="sameForm" onSubmit={handleSubmit(onSubmit)}>
    <>
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
                {...register("0")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="0">
                0
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="1"
                {...register("1")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="1">
                1
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="2"
                {...register("2")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="2">
                2
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="3"
                {...register("3")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="3">
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
                {...register("4")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="4">
                4
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="5"
                {...register("5")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="5">
                5
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="6"
                {...register("6")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="6">
                6
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="7"
                {...register("7")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="7">
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
                {...register("8")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="8">
                8
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="9"
                {...register("9")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="9">
                9
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="10"
                {...register("10")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="10">
                10
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="11"
                {...register("11")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="11">
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
                {...register("12")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="12">
                12
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                // defaultValue={false}
                id="13"
                {...register("13")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="13">
                13
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="14"
                {...register("14")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="14">
                14
              </label>
            </td>
            <td>
              <input
                type="checkbox"
                className="btn btn-check"
                id="15"
                {...register("15")}
              />
              <label className="btn btn-outline-primary cell" htmlFor="15">
                15
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </>
    // </form>
  );
};
export default CellArray;
