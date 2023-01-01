import React, { useEffect, useState } from "react";

import {
  Link,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import EthIcon from "../lib/eth-icon";

import Image from "mui-image";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function Monitor({ props }) {
  const [userInterval, setUserInterval] = useState(60000); // 60s
  const [notify, setNotify] = useState(false);

  const { parseData, parseError, parseLoading } = useParse(
    props ? props.url : null
  );

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  useEffect(() => {
    localStorage.setItem(props.url, JSON.stringify([]));
    if (props.setChildMetaData)
      props.setChildMetaData((prevState) => {
        return {
          ...prevState,
          ...{ [props.url]: { val: 0 } },
        };
      });
    if (props.notify) {
      setNotify(true);
    }
  }, []);

  useEffect(() => {
    if (props.notify) {
      setNotify(props.notify);
    }
  }, [props.notify]);

  useEffect(() => {
    const prevOrdersData = JSON.parse(localStorage.getItem(props.url));

    // sold out or delisted, set max lowest so next listing will alert
    if (
      prevOrdersData &&
      prevOrdersData.length >= 0 &&
      ordersData.length == 0
    ) {
      localStorage.setItem(props.url, JSON.stringify([Number.MAX_VALUE]));
      if (props.setChildMetaData)
        props.setChildMetaData((prevState) => {
          return {
            ...prevState,
            ...{ [props.url]: { val: 0 } },
          };
        });
    }

    // listings have arrived, set current lowest so next lowest will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData[0]) {
      localStorage.setItem(props.url, JSON.stringify(ordersData));
      if (props.setChildMetaData)
        props.setChildMetaData((prevState) => {
          return {
            ...prevState,
            ...{ [props.url]: { val: ordersData[0] } },
          };
        });
    }

    // lower listing has arrived, notify
    if (prevOrdersData && ordersData[0] < prevOrdersData[0]) {
      console.info(
        loopringData.metadataJson.name,
        prevOrdersData[0].toFixed(4),
        ordersData[0].toFixed(4)
      );

      if (notify && props.setSoundOff) props.setSoundOff(true);

      if (notify)
        new Notification(`${loopringData.metadataJson.name} Price Alert`, {
          body: `${ordersData[0].toFixed(4)} Lowest Found`,
          icon: `https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metadataJson.image.match(/(?<=.{7}).+/i)
              : undefined
          }`,
        });
      localStorage.setItem(props.url, JSON.stringify(ordersData));

      if (props.setChildMetaData)
        props.setChildMetaData((prevState) => {
          return {
            ...prevState,
            ...{ [props.url]: { val: ordersData[0] } },
          };
        });
    } else if (!ordersData.length == 0) {
      localStorage.setItem(props.url, JSON.stringify(ordersData));
      if (props.setChildMetaData)
        props.setChildMetaData((prevState) => {
          return {
            ...prevState,
            ...{ [props.url]: { val: ordersData[0] ? ordersData[0] : 0 } },
          };
        });
    }
  }, [ordersData]);

  if (parseError || loopringError || ordersError) {
    console.error("Network error", parseError, loopringError, ordersError);
    return (
      <Card raised={true}>
        <CardContent sx={{ pt: 0 }}>
          <Typography component="div">Failed to load</Typography>
        </CardContent>
      </Card>
    );
  }
  if (parseLoading || loopringLoading || ordersLoading)
    return (
      <Card raised={true}>
        <CardContent sx={{ pt: 0 }}>
          <Typography component="div">Loading...</Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card raised={true}>
      <CardHeader
        title={
          <Box sx={{ display: "flex" }}>
            <Box sx={{ marginInlineEnd: 1.5 }}>
              <Link
                underline="none"
                href={props.url}
                target="_blank"
                rel="noopener"
              >
                <Image
                  sx={{ borderRadius: 1 }}
                  height="32px"
                  src={`https://www.gstop-content.com/ipfs/${
                    loopringData
                      ? loopringData.metadataJson.image.match(/(?<=.{7}).+/i)
                      : undefined
                  }`}
                  alt={`${loopringData.metadataJson.name}`}
                />
              </Link>
            </Box>
            <Box>
              <Link
                variant="h6"
                underline="none"
                href={props.url}
                target="_blank"
                rel="noopener"
              >
                {`${loopringData.metadataJson.name}`}
              </Link>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "flex-end", flexGrow: 1 }}
            >
              {ordersData.length > 0 ? (
                <EthIcon sx={{ mt: 0.5, mr: 1 }} htmlColor="#7F38EC" />
              ) : undefined}
              <Typography
                sx={{ mr: 1 }}
                variant="h6"
                gutterBottom={false}
                hidden={!ordersData.length > 0}
              >
                {`${
                  ordersData.length > 0
                    ? ordersData[0].toFixed(4)
                    : "- . - - - -"
                }`}
              </Typography>
              <Typography
                sx={{ minWidth: "100px", whiteSpace: "pre-wrap" }}
                variant="h6"
                gutterBottom={false}
                hidden={!ordersData.length > 0}
              >
                {ordersData && ordersData.length > 0
                  ? `${ordersData.length.toString().padStart(4, " ")}/`
                  : undefined}
                {`${Number.parseInt(loopringData.amount)}`}
              </Typography>
            </Box>
          </Box>
        }
        action={
          props.setGSURLs ? (
            <IconButton
              aria-label="remove"
              onClick={() => {
                if (props.setGSURLs) {
                  props.setGSURLs(
                    props.gsURLs.filter((v, i) => i != props.index)
                  );
                  localStorage.setItem(
                    "gsURLs",
                    JSON.stringify(
                      props.gsURLs.filter((v, i) => i != props.index)
                    )
                  );
                }
              }}
            >
              <CloseIcon sx={{ height: 24, width: 24 }} />
            </IconButton>
          ) : undefined
        }
      />

      {/* <CardContent sx={{ pt: 0, pb: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <EthIcon fontSize="small" sx={{ mt: 0.2, mr: 0.2 }} />

          <Typography variant="body1" component="div">
            {`${
              ordersData.length > 0 ? ordersData[0].toFixed(4) : "- . - - - -"
            }`}
          </Typography>
          <Typography sx={{ ml: 2, mr: 1 }} variant="body1" component="div">
            {ordersData && ordersData.length > 0
              ? `${ordersData.length}/`
              : undefined}
            {`${Number.parseInt(loopringData.amount)}`}
          </Typography>
        </Box>
      </CardContent> */}
    </Card>
  );
}
