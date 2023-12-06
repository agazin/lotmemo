import { Button } from "@mui/material";
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import DeleteIcon from '@mui/icons-material/Delete';


interface FormData {
  no: string;
  sum: string;
}

enum Direction {
  UP = "UP",
  DOWN = "DOWN",
}

interface ConfigData {
  max: number;
  type: Direction.UP | Direction.DOWN;
}

const DataForm: React.FC = () => {
  const noInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<FormData[]>([]);
  const [downData, setDownData] = useState<FormData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    no: "",
    sum: "",
  });

  const confInputRef = useRef<HTMLInputElement>(null);
  const [confData, setConfData] = useState<ConfigData>({
    max: 0,
    type: Direction.UP,
  });

  const handleConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfData({ ...confData, [name]: parseInt(!value ? "0" : value) });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.no && formData.sum) {
      switch (confData.type) {
        case Direction.UP:
          setData([...data, formData]);
          break;
        case Direction.DOWN:
          setDownData([...downData, formData]);
          break;
      }
      setFormData({ no: "", sum: "" });
      noInputRef.current?.focus();
    }
  };

  const calculateSummary = () => {
    const summary: { [key: string]: number } = {};
    data.forEach((item) => {
      const no = item.no;
      const sum = parseFloat(item.sum);

      if (summary[no]) {
        summary[no] += sum;
      } else {
        summary[no] = sum;
      }
    });
    return summary;
  };

  const summaryData = calculateSummary();

  function handleDelete(index: number): void {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  }

  return (
    <div>
      <div className="flex">
        <div className="form-container flex-1 flex justify-center items-center">
          <form onSubmit={handleSubmit}>
            <label>
              No:
              <input
                type="text"
                name="no"
                value={formData.no}
                onChange={handleChange}
                ref={noInputRef}
              />
            </label>
            <br />
            <label>
              Price:
              <input
                type="text"
                name="sum"
                value={formData.sum}
                onChange={handleChange}
              />
            </label>
            <br />
            <button type="submit">Add Data</button>
          </form>
        </div>
        <div className="flex-1 flex flex-col justify-top items-start">
          <label>
            Max :
            <input
              type="text"
              name="max"
              value={confData.max}
              onChange={handleConfigChange}
              ref={confInputRef}
            />
          </label>
        </div>
      </div>

      <div style={{ display: "flex" }} className="table-container">
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h2>Source Table</h2>
          
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Sum</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.no}</td>
                  <td>{item.sum}</td>
                  <td width="100">
                    <Button variant="contained" startIcon={<DeleteIcon />}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h2>Summary Table</h2>
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Sum</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(summaryData).map((no, index) => (
                <tr key={index}>
                  <td>{no}</td>
                  <td
                    className={
                      summaryData[no] > confData.max
                        ? "bg-red-500"
                        : "text-red-950"
                    }
                  >
                    {summaryData[no]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataForm;
