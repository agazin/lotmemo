import styles from "./report.module.css";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { calculateBid } from "@/app/memo/page";
import { use, useEffect, useState } from "react";

export default function ReportPage({ lotmemo, tempCustomer }) {
  const [fresult, setFresult] = useState();
  // const style = {
  //   py: 0,
  //   width: '100%',
  //   borderRadius: 2,
  //   border: '1px solid',
  //   borderColor: 'divider',
  //   backgroundColor: 'background.paper',
  // };

  function buildTheResult(result) {
    const mergeResult =  result?.uppers?.map((obj) => ({ ...obj, type: "upper" }))
    .concat(result?.lowers?.map((obj) => ({ ...obj, type: "lower" })));
    if(!mergeResult) return [];
    const sortedResult = mergeResult.sort((a, b) => a.n - b.n);
    return sortedResult;
  }

  useEffect(() => {
    const result = lotmemo.memoList.map((memo, index) => {
      return memo.lotList?.map((lot) => {
        const unitFrom = lot.unitFrom;
        const unitActive = lot.unitActive;
        return calculateBid({ unitFrom, unitActive });
      });
    }); 
    const fresult = result.reduce(
      (acc, cur) => {
        cur.forEach((item) => {
          item.uppers.forEach((upper) => {
            const found = acc.uppers.find((accUpper) => accUpper.n === upper.n);
            if (found) {
              found.amt += parseInt(upper.amt);
            } else {
              acc.uppers.push({ n: upper.n, amt: parseInt(upper.amt) });
            }
          });

          item.lowers.forEach((lower) => {
            const found = acc.lowers.find((accLower) => accLower.n === lower.n);
            if (found) {
              found.amt += parseInt(lower.amt);
            } else {
              acc.lowers.push({ n: lower.n, amt: parseInt(lower.amt) });
            }
          });
        });
        return acc;
      },
      { uppers: [], lowers: [] }
    );
    setFresult(fresult);
  }, [lotmemo]);

  function getModeLabel(type) {
    switch (type) {
      case "upper":
        return "บน";
      case "lower":
        return "ล่าง";
      default:
        return "";
    }
   
  }
  return (
    <div>
      <div>
        <List className={styles.list}>
          {/* <ListItem>
            <ListItemText
              primary={`Profit Limit : ${lotmemo.config.profitLimit}`}
            />
          </ListItem>
          <Divider component="li" /> */}
          <ListItem>
            <ListItemText
              primary={`Loss Limit : ${lotmemo.config.lossLimit}`}
            />
          </ListItem>
          <Divider component="li" />
        </List>
      </div>
      <div style={{color:"black"}}>สรุปรายการ</div>
      <div>
        <List className={styles.list}>
          {buildTheResult(fresult).map((item, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText 
                  className={item.amt > lotmemo.config.lossLimit ? styles.danger : styles.normal}
                  primary={`${getModeLabel(item.type)} ${item.n} : ${item.amt}`}  />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </div>
      
      {/* {lotmemo.memoList.map((memo, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText primary={memo.customer} />
                <ListItemText
                  primary={
                    memo.lotList &&
                    memo.lotList.map((lot) => {
                      // console.log('lot' , lot);
                      const unitFrom = lot.unitFrom;
                      const unitActive = lot.unitActive;
                      const { uppers, lowers } = calculateBid({
                        unitFrom,
                        unitActive,
                      });
                      return `${lot.unitActive} `;
                    })
                  }
                />
              </ListItem>
              <Divider />
            </div>
          ))} */}
    </div>
  );
}
