import React, { useEffect, useState, useRef } from "react";

import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import chartTrendline from "chartjs-plugin-trendline";
import "chartjs-adapter-date-fns";

import { Typography } from "@mui/material";

export default function History({ props }) {
  const [labels, setLabels] = useState(undefined);
  const [data, setData] = useState(undefined);
  const [history, setHistory] = useState(undefined);

  const up = (ctx, value) =>
    ctx.p0.parsed.y <= ctx.p1.parsed.y ? value : undefined;

  const down = (ctx, value) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

  useEffect(() => {
    if (props.history)
      setHistory(
        props.history
          .filter(
            (o) =>
              o.transaction.orderA &&
              (parseFloat(o.transaction.orderA.amountS) * 1e-18) /
                parseFloat(o.transaction.orderA.amountB) <
                3
          )
          .sort(
            (a, b) =>
              a.createdAt - b.createdAt ||
              (parseFloat(a.transaction.orderA.amountS) * 1e-18) /
                parseFloat(a.transaction.orderA.amountB) -
                (parseFloat(b.transaction.orderA.amountS) * 1e-18) /
                  parseFloat(b.transaction.orderA.amountB)
          )
      );
  }, [props.history]);

  useEffect(() => {
    if (history)
      setLabels(
        history.map((sale) => new Date(sale.createdAt).toLocaleString())
      );
  }, [history]);

  useEffect(() => {
    if (labels)
      setData({
        labels: labels,
        datasets: [
          {
            backgroundColor: "white",
            borderColor: "black",
            tension: 0.02,
            pointRadius: 5,
            segment: {
              borderWidth: 5,
              borderColor: (ctx) => up(ctx, "#259b24") || down(ctx, "#e51c23"),
            },
            data: history.map((sale) => {
              return {
                y:
                  (parseFloat(sale.transaction.orderA.amountS) * 1e-18) /
                  parseFloat(sale.transaction.orderA.amountB),
                x: parseFloat(sale.createdAt),
              };
            }),
            trendlineLinear: {
              colorMin: "#259b24",
              colorMax: "#e51c23",
              lineStyle: "line",
              width: 2,
              projection: false,
            },
          },
        ],
      });
  }, [labels]);

  if (!data || !data.datasets[0].data[0]) {
    // console.log("(Unknown Data Structure)", history ? history : "No history");
    return <Typography>{`(Unknown Data Structure)`}</Typography>;
  }

  if (history.length == 1)
    return (
      <Typography>
        {(
          (parseFloat(history[0].transaction.orderA.amountS) * 1e-18) /
          parseFloat(history[0].transaction.orderA.amountB)
        ).toFixed(4)}
      </Typography>
    );

  // console.log(history);

  return (
    <div className="display">
      <Line
        id="chart"
        data={data}
        plugins={[chartTrendline]}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              ticks: {
                color: "white",
                font: {
                  size: 14,
                },
              },
              min: data.datasets[0].data[0].x,
              type: "time",
              time: { unit: "day" },
            },
            y: {
              ticks: {
                color: "white",
                font: {
                  size: 14,
                },
                callback: (v, i, t) => `${v} ETH`,
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}
