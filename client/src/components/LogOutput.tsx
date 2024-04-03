// turn this into a class?
// https://legacy.reactjs.org/docs/forms.html
// turn into controlled component?
// https://react.dev/learn/sharing-state-between-components#

import { useEffect, useState } from "react";

// interface LogProps {
//   logData: string;
// };

// const LogOutput: React.FunctionComponent<LogProps> = (props) => {
// const LogOutput: React.FC<LogProps> = ({logData}) => {
const LogOutput = ({ logData }: { logData: string }) => {
  // const {logData} = props
  const [logStorage, setLogStorage] = useState("");
  useEffect(() => {
    setLogStorage(logStorage.concat(logData) + "\n");
  }, [logData]);

  return (
    <>
      <div className="my-4 px-md-0">
        <h2>Log</h2>
        <div className="form-group">
          <textarea
            readOnly
            className="form-control"
            id="LogOutputTextArea"
            rows={20}
            value={logStorage}
          ></textarea>
        </div>
      </div>
    </>
  );
};

export default LogOutput;
