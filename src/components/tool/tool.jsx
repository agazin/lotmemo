"use client";

import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
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
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import styles from "./tool.module.css";
import React, { use, useEffect } from "react";
import {
  AddCircle,
  AddShoppingCart,
  ArrowUpward,
  ArrowUpwardRounded,
  Delete,
  Height,
  PlusOneOutlined,
} from "@mui/icons-material";
import { enumType, calculateBid } from "@/app/memo/page";
import { CheckCircleIcon,RepeatOutlined } from '@mui/icons-material';

const Tool = ({ addCustomer }) => {
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
  };
  const handleTypeUpClick = (activeTab) => {
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
    // const { uppers, lowers } = calculateBid(unitFrom, unitActive);
    // if (uppers) setUpperList([...upperList.concat(uppers)]);
    // if (lowers) setLowerList([...lowerList.concat(lowers)]);
    //check input n and amt
    if (unitFrom.unitFrom?.n < 0 || unitFrom.unitFrom?.amt < 0) {
      return;
    }
    //check mode selected
    if(unitFrom.unitFrom[unitActive].modes.length == 0) {
      return;
    }
    //check active tab 
    if(unitFrom.unitFrom.n.length != unitActive) {
      return;
    }

    const modes = [...(unitFrom.unitFrom[unitActive].modes || [])];
    const unit = {
      unitFrom: {
        ...{ ...unitFrom.unitFrom, [unitActive]: { modes: modes } },
      },
      unitActive: unitActive,
    };
    const lots = [...lotList.concat(unit)];
    // //add more 10 lots
    // const lot = lots.slice(0, 1);
    // for (let i = 0; i < 10; i++) {
    //   lots.push(lot[0]);
    // }
    setLotList(lots);
    recalulateBid(lots);
    resetInput();
  };

  function recalulateBid(lotList) {
    console.log("recalulateBid", lotList);
    let uppers = [];
    let lowers = [];
    lotList.forEach((unit) => {
      const { uppers: u, lowers: l } = calculateBid({
        unitFrom: unit.unitFrom,
        unitActive: unit.unitActive
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
    console.log("delete ", index);
  }

  function handleDeleteRowClick(index) {
    lotList.splice(index, 1);
    setLotList([...lotList]);
    recalulateBid(lotList);
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
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
  return (
    <div className={styles.container}>
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
          <TableContainer component={Paper} 
            sx={{ 
              minHeight: 'calc(100% - 20px)', 
              maxHeight: 'calc(100% - 20px)',
              overflowY: 'auto',
            }}>
            <Table sx={{ minWidth: 650 }} aria-label="sticky table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ประเภท</TableCell>
                  <TableCell align="center">บน</TableCell>
                  <TableCell align="center">ล่าง</TableCell>
                  <TableCell align="center">กลับเลข</TableCell>
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
                      {row.unitFrom[row.unitActive].modes?.includes(enumType.UP)
                        ? <CheckCircleIcon htmlColor="rgb(67, 253, 113)" />
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {row.unitFrom[row.unitActive].modes?.includes(
                        enumType.DOWN
                      )
                        ? <CheckCircleIcon htmlColor="rgb(67, 253, 113)" />
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {row.unitFrom[row.unitActive].modes?.includes(
                        enumType.REVERSE
                      )
                        ? <CheckCircleIcon htmlColor="rgb(67, 253, 113)" />
                        : "-"}
                    </TableCell>
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
          <div className={styles.confirmBtn} onClick={() => onConfirm()}  >
            ยืนยัน
          </div>
        </Box>
      </Modal>
      <div className={styles.title}>
        <div className={styles.period}>งวด 01/04/2567</div>
        <div className={styles.countdown}>146:10:35</div>
      </div>
      <div className={styles.panels}>
        <div className={styles.simulate}>
          <div className={styles.confirmBtn} onClick={handleOpen}>
            {getCounting()} รายการ
          </div>
          <div style={{ color: "var(--text-active-color)" }}>------------</div>
          <PerfectScrollbar>
            <div className={styles.simContent}>
              <div>
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
              </div>
            </div>
          </PerfectScrollbar>
        </div>
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
          <Container className={styles.panel} style={{ marginTop: "1rem" }}>
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
          </Container>
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
                />
              </FormControl>
            </Box>
            <Box>
              <div className={styles.buttonGroup}>
                <div className={styles.buttonInactive} onClick={() => { }}>
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
      </div>
    </div>
  );
};

export default Tool;
