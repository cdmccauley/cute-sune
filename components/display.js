import React, { useEffect, useState, useRef } from "react";

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function Display({ props }) {
  const up = (ctx, value) =>
    ctx.p0.parsed.y <= ctx.p1.parsed.y ? value : undefined;
  const down = (ctx, value) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

  if (
    !props ||
    props.ordersData.length == 0 ||
    props.ordersData[0] == Number.MAX_VALUE
  )
    return <div></div>;

  return (
    <div className="display">
      <Line
        id="chart"
        data={{
          labels: props.ordersData.filter(order => order < props.ordersData[0] * 10).map((order, i) => i),
          datasets: [
            {
              backgroundColor: "white",
              borderColor: "black",
              tension: 0.02,
              pointRadius: 5,
              segment: {
                borderWidth: 5,
                borderColor: (ctx) =>
                  up(ctx, "#259b24") || down(ctx, "#e51c23"),
              },
              data: props.ordersData.filter(order => order < props.ordersData[0] * 10).map((order, i) => {
                return {
                  y: order.toFixed(4),
                  x: i,
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
        }}
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
            //   min: data.datasets[0].data[0]
            //     ? data.datasets[0].data[0].x
            //     : Date.now(),
            //   type: "time",
            //   time: { unit: "day" },
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

// {
//     labels: Array.from(props.ordersData).map((order) => order.toString()),
//     datasets: [
//       {
//         backgroundColor: "white",
//         borderColor: "black",
//         tension: 0.02,
//         pointRadius: 5,
//         segment: {
//           borderWidth: 5,
//           borderColor: (ctx) => up(ctx, "#259b24") || down(ctx, "#e51c23"),
//         },
//         data: props.ordersData.map((order) => order.toFixed(4)),
//       },
//     ],
//   }
