// empty bracket indicates fragment
function ListGroup() {
  let items = ["New York", "Tokyo", "London", "Paris"];
//   items = [];

  // const message = items.length === 0 ? <p>No item found</p> : null;
  const getMessage = () => {
    return items.length === 0 ? <p>No item found</p> : null;
  };



  return (
    <>
      <h1>List</h1>
      {getMessage()}
      {items.length === 0 && <p>No item found</p>}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className="list-group-item active"
            key={item}
            onClick={(event) => console.log(item, index)}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
