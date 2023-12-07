import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowCircleDown, ArrowCircleUp } from "@mui/icons-material";
import Paper from "@mui/material/Paper";

interface FormData {
  no: string;
  sum: string;
  type: Direction.UP | Direction.DOWN;
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
    type: Direction.UP,
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
    console.log(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.no && formData.sum) {
      // switch (confData.type) {
      //   case Direction.UP:
      //     setData([...data, {...formData, type: confData.type}]);
      //     break;
      //   case Direction.DOWN:
      //     setDownData([...downData, {...formData, type: confData.type}]);
      //     break;
      // }
      setData([...data, { ...formData, type: confData.type }]);
      setFormData({ no: "", sum: "", type: confData.type });
      noInputRef.current?.focus();
    }
  };

  const calculateSummary = () => {
    const summary: { [key: string]: { [key: string]: number } } = {};
    data.forEach((item) => {
      console.log(summary);
      const no = item.no;
      const sum = parseInt(item.sum);
      if (summary[no]) {
        summary[no][item.type] += sum;
      } else {
        summary[no] = {
          [Direction.UP]: 0,
          [Direction.DOWN]: 0,
        };
        summary[no][item.type] = sum;
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

  const handleNumTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    console.log(newAlignment);
    setConfData({
      ...confData,
      type: newAlignment as Direction.UP | Direction.DOWN,
    });
  };

  return (
    <div>
      <div className="flex">
        <div className="form-container flex-1 flex justify-center items-center p-20">
          <form onSubmit={handleSubmit}>
            {/* <label>
              No:
              <input
                type="text"
                name="no"
                value={formData.no}
                onChange={handleChange}
                ref={noInputRef}
              />
            </label> */}
            <TextField
              id="data-no"
              label="Number"
              name="no"
              variant="outlined"
              value={formData.no}
              onChange={handleChange}
              ref={noInputRef}
            />
            <br />
            {/* <label>
              Price:
              <input
                type="text"
                name="sum"
                value={formData.sum}
                onChange={handleChange}
              />
            </label> */}
            <TextField
              id="data-sum"
              label="Price"
              name="sum"
              variant="outlined"
              value={formData.sum}
              onChange={handleChange}
            />
            <br />
            <div className="flex">
              <div className="flex-1 flex justify-center items-center ">
                <ToggleButtonGroup
                  value={confData.type}
                  onChange={handleNumTypeChange}
                  aria-label="text formatting"
                  color="primary"
                  exclusive
                  className="color-red-500"
                  size="small"
                >
                  <ToggleButton value={Direction.UP} aria-label="bold">
                    <ArrowCircleUp />
                  </ToggleButton>
                  <ToggleButton value={Direction.DOWN} aria-label="italic">
                    <ArrowCircleDown />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <Button variant="outlined" type="submit">
                  Add Data
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="flex-1 flex flex-col justify-top items-start p-20">
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

          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Act.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={row.no + row.sum}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.type === Direction.UP && (
                        <ArrowCircleUp color="primary" />
                      )}
                      {row.type === Direction.DOWN && (
                        <ArrowCircleDown color="secondary" />
                      )}
                      {row.no}
                    </TableCell>
                    <TableCell align="right">{row.sum}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h2>Summary Table</h2>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(summaryData).map((no, index) => (
                  <TableRow
                    key={no}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {no}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={
                        summaryData[no][Direction.UP] > confData.max ||
                        summaryData[no][Direction.DOWN] > confData.max
                          ? "bg-red-500"
                          : "text-red-950"
                      }
                    >
                      {summaryData[no][Direction.UP]} /{" "}
                      {summaryData[no][Direction.DOWN]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default DataForm;
