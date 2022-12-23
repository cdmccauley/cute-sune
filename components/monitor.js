import React, { useEffect, useState, useRef } from "react";

import {
  Link,
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import Image from "mui-image";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function Monitor({ props }) {
  const [userInterval, setUserInterval] = useState(60000); // 60s

  const { parseData, parseError, parseLoading } = useParse(props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  useEffect(() => {
    localStorage.setItem(props.url, JSON.stringify([]));
  }, []);

  useEffect(() => {
    const prevOrdersData = JSON.parse(localStorage.getItem(props.url));

    // // sold out or delisted, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length > 0 && ordersData.length == 0)
      localStorage.setItem(props.url, JSON.stringify([Number.MAX_VALUE]));

    // not listed, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData.length == 0)
      localStorage.setItem(props.url, JSON.stringify([Number.MAX_VALUE]));

    // listings have arrived, set current lowest so next lowest will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData[0])
      localStorage.setItem(props.url, JSON.stringify(ordersData));

    // lower listing has arrived, notify
    if (prevOrdersData && ordersData[0] < prevOrdersData[0]) {
      console.info(
        loopringData.metaData.name,
        prevOrdersData[0].toFixed(4),
        ordersData[0].toFixed(4)
      );
      props.setSoundOff(true);

      new Notification(`${loopringData.metaData.name} Price Alert`, {
        body: `${ordersData[0].toFixed(4)} Lowest Found`,
        icon: `https://www.gstop-content.com/ipfs/${
          loopringData
            ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
            : undefined
        }`,
      });
      localStorage.setItem(props.url, JSON.stringify(ordersData));
    } else if (!ordersData.length == 0) {
      localStorage.setItem(props.url, JSON.stringify(ordersData));
    }
  }, [ordersData]);

  if (parseError || loopringError || ordersError)
    return <div>Failed to load</div>;
  if (parseLoading || loopringLoading || ordersLoading)
    return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader
        title={
          <Link
            variant="h6"
            underline="none"
            href={props.url}
            target="_blank"
            rel="noopener"
          >
            {`${loopringData.metaData.name}`}
          </Link>
        }
        action={
          <IconButton
            aria-label="remove"
            onClick={() => {
              props.setGSURLs(props.gsURLs.filter((v, i) => i != props.index));
              localStorage.setItem(
                "gsURLs",
                JSON.stringify(props.gsURLs.filter((v, i) => i != props.index))
              );
            }}
          >
            <CloseIcon sx={{ height: 24, width: 24 }} />
          </IconButton>
        }
      />
      <Box sx={{ display: "flex" }}>
        <CardMedia
          component="img"
          sx={{ width: 125 }}
          src={`https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
              : undefined
          }`}
          alt={`${loopringData.metaData.name}`}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{pt: 0}}>
            <Typography component="div">
              {`${ordersData ? ordersData.length : 0} Prices Found`}
            </Typography>

            <Typography component="div" hidden={!ordersData.length > 0}>
              {`${
                ordersData.length > 0 ? ordersData[0].toFixed(4) : undefined
              } Lowest Found`}
            </Typography>
          </CardContent>
        </Box>
      </Box>
    </Card>
  );
}
