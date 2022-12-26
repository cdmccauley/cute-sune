import React, { useEffect, useState, useRef } from "react";

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function Display({ props }) {
  const LIMITS = {
    MAX: props.ordersData,
    INDEX: props.ordersData.slice(0, 10),
    PERCENT: props.ordersData.filter(
      (order) => order < props.ordersData[0] * 2.5
    ),
  };

  const [limitMethod, setLimitMethod] = useState(
    props && props.limitMethod ? props.limitMethod : "MAX"
  );

  useEffect(() => {
    setLimitMethod(props.limitMethod);
  }, [props.limitMethod]);

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
          labels: LIMITS[limitMethod].map((order, i) => i + 1),
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
              data: LIMITS[limitMethod].map((order, i) => {
                return {
                  y: order.toFixed(4),
                  x: i + 1,
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
