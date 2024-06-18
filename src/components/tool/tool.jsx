"use client";

import { calculateBid, enumType } from "@/app/memo/page";
import {
  AddShoppingCart,
  CheckCircle,
  Delete,
  ModeEdit
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  Modal,
  OutlinedInput,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs
} from "@mui/material";
import Divider from "@mui/material/Divider";
import React from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import styles from "./tool.module.css";

const Tool = ({ addCustomer, setTempCustomer, lotmemo }) => {
  console.log("Tool lotmemo", lotmemo);
  // const enumType = {
  //   UP: "UP",
  //   DOWN: "DOWN",
  //   SUFFLE: "SUFFLE",
  //   REVERSE: "REVERSE",
  // };
  const unitDigitForm = {
    1: {},
    2: {},
    3: {},
  };
  const [lotList, setLotList] = React.useState([]);
  const [unitFrom, setUnitFrom] = React.useState({
    ...unitDigitForm,
    // 2: { modes: [enumType.UP] , reverse: true},
    // 2: { modes: [enumType.UP, enumType.REVERSE] },
  });
  const [unitActive, setUnitActive] = React.useState("2");
  const [typeUp, setTypeUp] = React.useState(false);
  const [typeDown, setTypeDown] = React.useState(false);
  const [typeSuffle, setTypeSuffle] = React.useState(false);
  const [reverse, setReverse] = React.useState(false);
  const [n, setN] = React.useState(-1);
  const [amt, setAmt] = React.useState(-1);
  const [upperList, setUpperList] = React.useState([]);
  const [lowerList, setLowerList] = React.useState([]);
  const [indexActive, setIndexActive] = React.useState(-1);

  const handleChange = (event, newValue) => {
    setUnitActive(newValue);
    setUnitFrom({
      ...{
        1: {},
        2: {},
        3: {},
      },
    });
    setReverse(false);
    setTypeUp(false);
    setTypeDown(false);
    setTypeSuffle(false);
    resetInput();
  };

  const resetInput = () => {
    setN(-1);
    setAmt(-1);
    setUnitFrom({
      ...unitFrom,
      n: -1,
      amt: -1,
    });
    setIndexActive(-1);
  };

  function resetType() {
    setTypeUp(false);
    setTypeDown(false);
    setTypeSuffle(false);
    setReverse(false);
    const u = { ...unitFrom, [unitActive]: { modes: [] } };
    setUnitFrom(u);
    return u;
  }
  const handleTypeUpClick = (activeTab) => {
    const unitFrom = resetType();
    const modes = unitFrom[unitActive].modes || [];
    if (typeUp) {
      const index = modes.indexOf(enumType.UP);
      modes.splice(index, 1);
    } else {
      modes.push(enumType.UP);
    }
    setTypeUp(!typeUp);
    const u = { ...unitFrom, [unitActive]: { modes: [...modes] } };
    setUnitFrom(u);
  };
  const handleTypeDownClick = () => {
    const unitFrom = resetType();
    const modes = unitFrom[unitActive].modes || [];
    if (typeDown) {
      const index = modes.indexOf(enumType.DOWN);
      modes.splice(index, 1);
    } else {
      modes.push(enumType.DOWN);
    }
    setTypeDown(!typeDown);
    const u = { ...unitFrom, [unitActive]: { modes: [...modes] } };
    setUnitFrom(u);
  };

  const handleTypeReverseClick = () => {
    if (unitActive === "1") {
      return;
    }
    const modes = unitFrom[unitActive].modes || [];
    if (modes.includes(enumType.REVERSE)) {
      const index = modes.indexOf(enumType.REVERSE);
      modes.splice(index, 1);
      setReverse(false);
    } else {
      modes.push(enumType.REVERSE);
      setReverse(true);
    }
    setUnitFrom({ ...unitFrom, [unitActive]: { modes: [...modes] } });
  };

  const handleTypeSuffleClick = () => {
    const unitFrom = resetType();
    const modes = unitFrom[unitActive].modes || [];
    if (modes.includes(enumType.SUFFLE)) {
      const index = modes.indexOf(enumType.SUFFLE);
      modes.splice(index, 1);
      setTypeSuffle(false);
    } else {
      modes.push(enumType.SUFFLE);
      setTypeSuffle(true);
    }
    setUnitFrom({ ...unitFrom, [unitActive]: { modes } });
  };

  const handleNumChange = (value) => {
    let limit = 0;
    if (unitActive === "1") {
      limit = 9;
    } else if (unitActive === "2") {
      limit = 99;
    } else if (unitActive === "3") {
      limit = 999;
    }
    if (value < 0 || value > limit) {
      return;
    }
    setN(value);
    setUnitFrom({
      ...unitFrom,
      n: value,
    });
  };

  const handleAmtChange = (value) => {
    setAmt(value);
    setUnitFrom({
      ...unitFrom,
      amt: value,
    });
  };

  const handleBid = (unitFrom) => {
    console.log("unitFrom", unitFrom);
    // const { uppers, lowers } = calculateBid(unitFrom, unitActive);
    // if (uppers) setUpperList([...upperList.concat(uppers)]);
    // if (lowers) setLowerList([...lowerList.concat(lowers)]);
    //check input n and amt
    if (unitFrom.unitFrom?.n < 0 || unitFrom.unitFrom?.amt < 0) {
      return;
    }
    //check mode selected
    if (unitFrom.unitFrom[unitActive].modes.length == 0) {
      return;
    }
    //check active tab
    if (unitFrom.unitFrom.n.length != unitActive) {
      return;
    }

    const modes = [...(unitFrom.unitFrom[unitActive].modes || [])];
    const unit = {
      unitFrom: {
        ...{ ...unitFrom.unitFrom, [unitActive]: { modes: modes } },
      },
      unitActive: unitActive,
    }; // { unitFrom: { n: 123, amt: 100, 2: { modes: [UP] } }, unitActive: 2 }
    if (indexActive >= 0) {
      lotList[indexActive] = unit;
      setIndexActive(-1);
    } else {
      lotList.push(unit);
    }
    const lots = [...lotList];
    // //add more 10 lots
    // const lot = lots.slice(0, 1);
    // for (let i = 0; i < 10; i++) {
    //   lots.push(lot[0]);
    // }
    setTempCustomer({ ...{ customer: "temp", lotList: lots } });
    setLotList(lots);
    recalulateBid(lots);
    resetInput();
    const input = document.getElementById("outlined-adornment-number");
    input.select();
  };

  function handleEditRowClick(index) {
    const unit = lotList[index];
    setIndexActive(index);
    setUnitActive(unit.unitActive);
    setUnitFrom(unit.unitFrom);
    setN(unit.unitFrom.n);
    setAmt(unit.unitFrom.amt);
    const modes = unit.unitFrom[unit.unitActive].modes || [];
    setTypeUp(modes.includes(enumType.UP));
    setTypeDown(modes.includes(enumType.DOWN));
    setTypeSuffle(modes.includes(enumType.SUFFLE));
    setReverse(modes.includes(enumType.REVERSE));
    const input = document.getElementById("outlined-adornment-amount");
    input.select();
  }

  function recalulateBid(lotList) {
    let uppers = [];
    let lowers = [];
    lotList.forEach((unit) => {
      const { uppers: u, lowers: l } = calculateBid({
        unitFrom: unit.unitFrom,
        unitActive: unit.unitActive,
      });
      if (u) uppers = [...uppers.concat(u)];
      if (l) lowers = [...lowers.concat(l)];
    });
    setUpperList(uppers);
    setLowerList(lowers);
  }

  function onConfirm() {
    addCustomer(lotList);
    clearToolContent();
    handleClose();
  }

  function clearToolContent() {
    setUpperList([]);
    setLowerList([]);
    setLotList([]);
    resetInput();
    // handleChange(null, unitActive);
  }

  function getCounting() {
    return upperList.length + lowerList.length;
  }

  function handleHoverOnDelete(e) {
    //find the third div and change the color
    const div = e.target.parentNode.children[2];
    div.style.cursor = "pointer";
    div.style.display = "inline-block";
    // console.log("hover", e);
  }

  function handleHoverOutDelete(e) {
    //find the third div and change the color
    const div = e.target.parentNode.children[2];
    div.style.cursor = "default";
    div.style.display = "none";
  }

  function handleDeleteRowClick(index) {
    // console.log("delete ", index);
  }

  function handleDeleteRowClick(index) {
    lotList.splice(index, 1);
    setLotList([...lotList]);
    recalulateBid(lotList);
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    // setOpen(true);
    onConfirm();
  };
  const handleClose = () => setOpen(false);

  // useEffect(() => {
  //   setTypeUp(unitFrom[unitActive].modes?.includes(enumType.UP));
  //   setTypeDown(unitFrom[unitActive].modes?.includes(enumType.DOWN));
  //   setReverse(unitFrom[unitActive].modes?.includes(enumType.REVERSE));
  //   setTypeSuffle(unitFrom[unitActive].modes?.includes(enumType.SUFFLE));
  // }, [unitActive]);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "90%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  function getModeLabel(modes) {
    if (modes.includes(enumType.UP) && modes.includes(enumType.DOWN)) {
      return "บน/ล่าง";
    } else if (modes.includes(enumType.UP)) {
      return "บน";
    } else if (modes.includes(enumType.DOWN)) {
      return "ล่าง";
    } else if (modes.includes(enumType.SUFFLE)) {
      return "โต๊ด";
    }
    return "";
  }
  return (
    <div>
      <Modal
        sx={style}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ width: "100%", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              cursor: "pointer",
              padding: "0.5rem",
              fontSize: "1.5rem",
            }}
            onClick={handleClose}
          >
            x
          </div>
          <TableContainer
            component={Paper}
            sx={{
              minHeight: "calc(100% - 20px)",
              maxHeight: "calc(100% - 20px)",
              overflowY: "auto",
            }}
          >
            <Table
              sx={{ minWidth: 650 }}
              aria-label="sticky table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell>ประเภท</TableCell>
                  <TableCell align="center">บน</TableCell>
                  <TableCell align="center">ล่าง</TableCell>
                  {/* <TableCell align="center">กลับเลข</TableCell> */}
                  <TableCell align="right">เลข</TableCell>
                  <TableCell align="right">ราคา</TableCell>
                  <TableCell align="center">action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lotList.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.unitActive} ตัว
                    </TableCell>
                    <TableCell align="center">
                      {row.unitFrom[row.unitActive].modes?.includes(
                        enumType.UP
                      ) ? (
                        <CheckCircle htmlColor="rgb(67, 253, 113)" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.unitFrom[row.unitActive].modes?.includes(
                        enumType.DOWN
                      ) ? (
                        <CheckCircle htmlColor="rgb(67, 253, 113)" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    {/* <TableCell align="center">
                      {row.unitFrom[row.unitActive].modes?.includes(
                        enumType.REVERSE
                      )
                        ? <CheckCircle htmlColor="rgb(67, 253, 113)" />
                        : "-"}
                    </TableCell> */}
                    <TableCell align="right">{row.unitFrom.n}</TableCell>
                    <TableCell align="right">{row.unitFrom.amt}</TableCell>
                    <TableCell align="center">
                      <div
                        style={{
                          color: "red",
                          cursor: "pointer",
                          display: "inline-block",
                        }}
                        onClick={() => handleDeleteRowClick(index)}
                      >
                        x
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className={styles.confirmBtn} onClick={() => onConfirm()}>
            ยืนยัน
          </div>
        </Box>
      </Modal>
      <div className={styles.title}>
        <div className={styles.period}>งวด 01/04/2567</div>
        <div className={styles.countdown}>
           <Button>
             ลูกค้าทั้งหมด {lotmemo.memoList.length - 1} คน
           </Button>
        </div>
      </div>
      <div className={styles.panels}>
        <div className={styles.tool}>
          <Container className={styles.panel}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={unitActive}
                onChange={handleChange}
                aria-label="basic tabs example"
                variant="fullWidth"
              >
                <Tab label="1 ตัว" value="1" />
                <Tab label="2 ตัว" value="2" />
                <Tab label="3 ตัว" value="3" />
              </Tabs>
            </Box>
            <Box>
              <div className={styles.content}>
                {unitActive === "1" && (
                  <div className={styles.buttonGroup}>
                    <div
                      className={typeUp ? styles.button : styles.buttonInactive}
                      onClick={() => handleTypeUpClick(enumType.UP)}
                    >
                      1 ตัวบน
                    </div>
                    <div
                      className={
                        typeDown ? styles.button : styles.buttonInactive
                      }
                      onClick={() => handleTypeDownClick(enumType.DOWN)}
                    >
                      1 ตัวล่าง
                    </div>
                  </div>
                )}
                {unitActive === "2" && (
                  <div className={styles.buttonGroup}>
                    <div
                      className={typeUp ? styles.button : styles.buttonInactive}
                      onClick={() => handleTypeUpClick(enumType.UP)}
                    >
                      2 ตัวบน
                    </div>
                    <div
                      className={
                        typeDown ? styles.button : styles.buttonInactive
                      }
                      onClick={() => handleTypeDownClick(enumType.DOWN)}
                    >
                      2 ตัวล่าง
                    </div>
                  </div>
                )}
                {unitActive === "3" && (
                  <div className={styles.buttonGroup}>
                    <div
                      className={typeUp ? styles.button : styles.buttonInactive}
                      onClick={() => handleTypeUpClick(enumType.UP)}
                    >
                      3 ตัวบน
                    </div>
                    <div
                      className={
                        typeSuffle ? styles.button : styles.buttonInactive
                      }
                      onClick={() => handleTypeSuffleClick(enumType.DOWN)}
                    >
                      3 ตัวโต๊ด
                    </div>
                  </div>
                )}
              </div>
            </Box>
          </Container>
          {/* <Container className={styles.panel} style={{ marginTop: "1rem" }}>
            <Box>
              <div className={styles.content}>
                <div
                  className={reverse ? styles.button : styles.buttonInactive}
                  onClick={() => handleTypeReverseClick()}
                >
                  <RepeatOutlined /> กลับเลข <RepeatOutlined />
                </div>
              </div>
            </Box>
          </Container> */}
          <Container className={styles.panel} style={{ marginTop: "1rem" }}>
            <Box>
              <FormControl sx={{ m: 1, width: "45%" }}>
                <InputLabel htmlFor="outlined-adornment-number">เลข</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-number"
                  // startAdornment={
                  //   <InputAdornment position="start">$</InputAdornment>
                  // }
                  label="number"
                  value={n < 0 ? "" : n}
                  onChange={(e) => handleNumChange(e.target.value)}
                  autoComplete="off"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleBid({
                        unitFrom: { ...unitFrom },
                        unitActive,
                      });
                    }
                  }}
                />
              </FormControl>
              <FormControl sx={{ m: 1, width: "45%" }}>
                <InputLabel htmlFor="outlined-adornment-amount">
                  ราคา
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  endAdornment={
                    <InputAdornment position="end">บาท</InputAdornment>
                  }
                  label="Amount"
                  value={amt < 0 ? "" : amt}
                  onChange={(e) => handleAmtChange(e.target.value)}
                  autoComplete="off"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleBid({
                        unitFrom: { ...unitFrom },
                        unitActive,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      console.log("tab");
                      e.preventDefault();
                      const input = document.getElementById(
                        "outlined-adornment-number"
                      );
                      input.select();
                    }
                  }}
                />
              </FormControl>
            </Box>
            <Box>
              <div className={styles.buttonGroup}>
                <div className={styles.buttonInactive} onClick={() => {
                  resetInput();
                }}>
                  <Delete /> เคลียร์
                </div>
                <div
                  className={styles.button}
                  onClick={() =>
                    handleBid({
                      unitFrom: { ...unitFrom },
                      unitActive,
                    })
                  }
                >
                  <AddShoppingCart /> เพิ่ม
                </div>
              </div>
            </Box>
          </Container>
        </div>
        <div className={styles.simulate}>
          <div style={{display:'flex'}}>
            <div style={{flex: 8}}>
              <FormControl sx={{ width: "90%"}}>
                <InputLabel htmlFor="outlined-adornment-customer">ชื่อลูกค้า</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-customer"
                  label="customer"
                  value="customer1"
                  />
              </FormControl>

            </div>
            <div className={styles.confirmBtn} style={{flex: 2}} onClick={handleOpen}>
              ยืนยัน <br/> {getCounting()} รายการ
            </div>
          </div>
          <Divider
            color="black"
            variant="middle"
            flexItem
            sx={{
              width: "80%",
              height: "1px",
              backgroundColor: "black",
              margin: "1rem 0",
            }}
          />
          <PerfectScrollbar>
            <div className={styles.simContent}>
              {/* <div>
                {upperList && upperList.length > 0 && <div>[บน]</div>}
                {upperList &&
                  upperList.map((item, index) => (
                    <div
                      key={`up-${index}`}
                      className={styles.simItem}
                      onMouseOver={handleHoverOnDelete}
                      onMouseOut={handleHoverOutDelete}
                    >
                      <div className={styles.simNumber}>{item.n}</div>
                      <div className={styles.simAmt}>{item.amt}</div>
                      <div
                        className={styles.deleteBtn}
                        onClick={(e) => handleDeleteRowClick(`up-${index}`)}
                      >
                        x
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                {lowerList && lowerList.length > 0 && <div>[ล่าง]</div>}
                {lowerList &&
                  lowerList.map((item, index) => (
                    <div key={`down-${index}`} className={styles.simItem}>
                      <div className={styles.simNumber}>{item.n}</div>
                      <div className={styles.simAmt}>{item.amt}</div>
                    </div>
                  ))}
              </div> */}
              <TableContainer
                component={Paper}
                sx={{
                  minHeight: "calc(100% - 20px)",
                  maxHeight: "calc(100% - 20px)",
                  overflowY: "auto",
                }}
              >
                <Table aria-label="sticky table" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">เลข</TableCell>
                      <TableCell align="center">ประเภท</TableCell>
                      <TableCell align="right">ราคา</TableCell>
                      <TableCell align="center">action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lotList.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={
                          (indexActive === index && {
                            backgroundColor: "rgb(220, 220, 220)",
                          }) || {
                            "&:last-child td, &:last-child th": { border: 0 },
                          }
                        }
                      >
                        <TableCell align="right">{row.unitFrom.n}</TableCell>
                        <TableCell align="right">
                          <div style={{ display: "flex" }}>
                            <div
                              style={{
                                textAlign: "left",
                                flex: "1",
                                paddingLeft: "10px",
                              }}
                            >
                              {row.unitActive} ตัว{" "}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              {getModeLabel(row.unitFrom[row.unitActive].modes)}{" "}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              handleEditRowClick(index);
                            }}
                          >
                            {row.unitFrom.amt}
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <ModeEdit
                            sx={{ cursor: "pointer", color: "blue" }}
                            onClick={() => {
                              handleEditRowClick(index);
                            }}
                          />
                          <Delete
                            sx={{ cursor: "pointer", color: "red" }}
                            onClick={() => {
                              handleDeleteRowClick(index);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </PerfectScrollbar>
        </div>
      </div>
    </div>
  );
};

export default Tool;
