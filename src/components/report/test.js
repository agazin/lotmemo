const a = [
  [
    {
      uppers: [
        {
          n: "12",
          amt: "10",
        },
        {
          n: "11",
          amt: "10",
        },
      ],
      lowers: [{
        n: "11",
        amt: "10",
      },],
    },
  ],
  [
    {
      uppers: [
        {
          n: "12",
          amt: "10",
        },{
            n: "11",
            amt: "10",
          },
      ],
      lowers: [],
    },
    {
      uppers: [
        {
          n: "12",
          amt: "10",
        },{
            n: "11",
            amt: "10",
          },
      ],
      lowers: [],
    },
  ] 
];

// group by uppers and lowers with n and sum amt
// and return the result as {uppers: [{n: sum}], lowers: [{n: sum}]}
const result = a.reduce((acc, cur) => {
  const [item] = cur;
  const { uppers, lowers } = item;
  uppers.forEach(({ n, amt }) => {
    const found = acc.uppers.find((x) => x.n === n);
    if (found) {
      found.amt += Number(amt);
    } else {
      acc.uppers.push({ n, amt: Number(amt) });
    }
  });
  lowers.forEach(({ n, amt }) => {
    const found = acc.lowers.find((x) => x.n === n);
    if (found) {
      found.amt += Number(amt);
    } else {
      acc.lowers.push({ n, amt: Number(amt) });
    }
  });
  return acc;
}, { uppers: [], lowers: [] });










// const result = a.reduce((acc, cur) => {
//   const [item] = cur;
//   const { uppers, lowers } = item;
//   uppers.forEach(({ n, amt }) => {
//     acc[n] = (acc[n] || 0) + Number(amt);
//   });
//   lowers.forEach(({ n, amt }) => {
//     acc[n] = (acc[n] || 0) + Number(amt);
//   });
//   return acc;
// }, {});

