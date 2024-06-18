"use client";
import styles from "./memo.module.css";
import Tool from "@/components/tool/tool";
import ReportPage from "@/components/report/report";
import React, { use, useEffect, useState } from "react";
import { Button } from "@mui/material";

export const enumType = {
  UP: "UP",
  DOWN: "DOWN",
  SUFFLE: "SUFFLE",
  REVERSE: "REVERSE",
};

export const calculateBid = ({ unitFrom, unitActive }) => {
  const n = unitFrom?.n ?? 0;
  const amt = unitFrom?.amt ?? 0;
  const upperList = [];
  const lowerList = [];
  const isUp = unitFrom[unitActive].modes?.includes(enumType.UP);
  const isDown = unitFrom[unitActive].modes?.includes(enumType.DOWN);
  const isResvrse = unitFrom[unitActive].modes?.includes(enumType.REVERSE);
  const isSuffle = unitFrom[unitActive].modes?.includes(enumType.SUFFLE);
  if (isUp) {
    if (isResvrse) {
      const reverseN = n.toString().split("").reverse().join("");
      upperList.push(...[
        { n: n, amt: amt },
        { n: reverseN, amt: amt },
      ]);
    } else {
      upperList.push({ n: n, amt: amt });
    }
  }
  if (isDown) {
    if (isResvrse) {
      const reverseN = n.toString().split("").reverse().join("");
      lowerList.push(...[
        { n: n, amt: amt },
        { n: reverseN, amt: amt },
      ]);
    } else {
      lowerList.push({ n: n, amt: amt });
    }
  }
  if (isSuffle) {
    const permutations = getPermutations(n.toString());
    const shuffleList = permutations.map((item) => {
      return { n: item, amt: amt / (permutations.length ?? 1) };
    });
    upperList.push(...shuffleList);
  }
  return { uppers: upperList, lowers: lowerList };
};

export function getPermutations(nums) {
  let results = [];

  if (nums.length === 1) {
    results.push(nums);
    return results;
  }

  for (let i = 0; i < nums.length; i++) {
    let firstChar = nums[i];
    let charsLeft = nums.substring(0, i) + nums.substring(i + 1);
    let innerPermutations = getPermutations(charsLeft);
    for (let j = 0; j < innerPermutations.length; j++) {
      results.push(firstChar + innerPermutations[j]);
    }
  }
  results = [...new Set(results)];
  return results;
}

export default function MemoPage() {
  const [lotmemo, setLotmemo] = React.useState({
    config: {
      lossLimit: 1000,
      profitLimit: 1000,
    },
    memoList: [],
  });

  // temp customer
  const [tempCustomer, setTempCustomer] = React.useState({
    customer: "temp",
    lotList: [
    ],
  });
  useEffect(() => {
    //set by replace the tempCustomer to the lotmemo
    const memoList = lotmemo
                      .memoList
                      .filter((item) => item.customer !== tempCustomer.customer);

    setLotmemo({
      ...lotmemo,
      memoList: [
        ...memoList,
        {
          customer: tempCustomer.customer,
          lotList: tempCustomer.lotList,
        },
      ],  
    });
  }, [tempCustomer]);


  const addCustomer = (lotList) => {
    console.log("addCustomer", lotList);
    const memoList = lotmemo.memoList
                      .filter((item) => item.customer !== tempCustomer.customer);  
    setLotmemo({
      ...lotmemo,
      memoList: [
        ...memoList,
        {
          customer: "customer" + (lotmemo.memoList.length + 1),
          lotList: lotList,
        },
      ],
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tool}>
        <Tool addCustomer={addCustomer} setTempCustomer={setTempCustomer} lotmemo={lotmemo} />
      </div>
      <div className={styles.report}>
        <ReportPage lotmemo={lotmemo} tempCustomer={tempCustomer} />
      </div>
    </div>
  );
}
