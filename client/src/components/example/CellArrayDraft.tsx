// import { useState, createElement } from "react";

// function createTable(size: 4) {
//   // const alpha = Array.from(Array(26)).map((e, i) => i + 65);
//   // const alphabet = alpha.map((x) => String.fromCharCode(x));
//   // console.log(alphabet);

//   // const initTableDimFour = [{}];

//   // // Create the table element
//   // let generatedCellArray = createElement("table");

//   // //  Get the keys (column names) of the first object in the JSON data
//   // let cols = Array.from(Array(size).keys());

//   // // Create the header element
//   // let thead = createElement("thead");
//   // let tr = createElement("tr");

//   // // Loop through the column names and create header cells
//   // let col_header = cols.map((val) => {
//   //   createElement("th", { id: val }, val);
//   // });

//   // //  thead.appendChild(tr); // Append the header row to the header
//   // //  generatedCellArray.append(tr) // Append the header to the table

//   //  // Loop through the JSON data and create table rows
//   //  let rows = cols;

//   //  jsonData.forEach((item) => {
//   //     let tr = document.createElement("tr");

//   //     // Get the values of the current object in the JSON data
//   //     let vals = Object.values(item);

//   //     // Loop through the values and create table cells
//   //     vals.forEach((elem) => {
//   //        let td = document.createElement("td");
//   //        td.innerText = elem; // Set the value as the text of the table cell
//   //        tr.appendChild(td); // Append the table cell to the table row
//   //     });
//   //     generatedCellArray.appendChild(tr); // Append the table row to the table
//   //  });

//   return (
//     <table className="table">
//       <thead>
//         <tr>
//           <th scope="col"></th>
//           <th scope="col">0</th>
//         </tr>
//       </thead>

//       <tbody>
//         <tr>
//           <th scope="row">0</th>
//           <td>
//             <input type="checkbox" className="btn-check" id="0-0" />
//             <label className="btn btn-outline-primary" htmlFor="0-0">
//               -
//             </label>
//           </td>
//         </tr>
//       </tbody>
//     </table>
//   );
// }

// function createTableFromJSON() {
//   // https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery
//   return 0;
// }

// function createJSONFromTable() {

//   const templateJSON = [{}];


//   return 0;
// }

function CellArray() {
  //   const getCells = (x, y) => {
  //     return (
  //         <p>x y</p>
  //         // for (let i=0;i<5;i++) {
  //         //     console.log(x, y);
  //         // }
  //     );
  //   };

  return (
    <form className="" id="arrayContainer text-center">
      {/* {createTable(4)} */}
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
            <th scope="row">0</th>
            <td>
              <input type="checkbox" className="btn btn-check" id="0-0" />
              <label className="btn btn-outline-primary" htmlFor="0-0">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="0-1" />
              <label className="btn btn-outline-primary" htmlFor="0-1">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="0-2" />
              <label className="btn btn-outline-primary" htmlFor="0-2">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="0-3" />
              <label className="btn btn-outline-primary" htmlFor="0-3">
                -
              </label>
            </td>
          </tr>
          <tr>
            <th scope="row">1</th>
            <td>
              <input type="checkbox" className="btn-check" id="1-0" />
              <label className="btn btn-outline-primary" htmlFor="1-0">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="1-1" />
              <label className="btn btn-outline-primary" htmlFor="1-1">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="1-2" />
              <label className="btn btn-outline-primary" htmlFor="1-2">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="1-3" />
              <label className="btn btn-outline-primary" htmlFor="1-3">
                -
              </label>
            </td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>
              <input type="checkbox" className="btn-check" id="2-0" />
              <label className="btn btn-outline-primary" htmlFor="2-0">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="2-1" />
              <label className="btn btn-outline-primary" htmlFor="2-1">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="2-2" />
              <label className="btn btn-outline-primary" htmlFor="2-2">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="2-3" />
              <label className="btn btn-outline-primary" htmlFor="2-3">
                -
              </label>
            </td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>
              <input type="checkbox" className="btn-check" id="3-0" />
              <label className="btn btn-outline-primary" htmlFor="3-0">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="3-1" />
              <label className="btn btn-outline-primary" htmlFor="3-1">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="3-2" />
              <label className="btn btn-outline-primary" htmlFor="3-2">
                -
              </label>
            </td>
            <td>
              <input type="checkbox" className="btn-check" id="3-3" />
              <label className="btn btn-outline-primary" htmlFor="3-3">
                -
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
}
export default CellArray;

// <table className="table">
// <thead>
//   <tr>
//     <th scope="col"></th>
//     <th scope="col">1</th>
//     <th scope="col">2</th>
//     <th scope="col">3</th>
//   </tr>
// </thead>

// <tbody>
//   <tr>
//     <th scope="row">A</th>
//     <td>
//       <input
//         type="checkbox"
//         className="btn-check"
//         id="btn-check-outlined"
//       />
//       <label className="btn btn-outline-primary" htmlFor="btn-check-outlined">
//         -
//       </label>
//     </td>
//     <td>Otto</td>
//     <td>@mdo</td>
//   </tr>

//   <tr>
//     <th scope="row">B</th>
//     <td>Jacob</td>
//     <td>Thornton</td>
//     <td>@fat</td>
//   </tr>

//   <tr>
//     <th scope="row">C</th>
//     <td colSpan={2}>Larry the Bird</td>
//     <td>@twitter</td>
//   </tr>
// </tbody>

// </table>
