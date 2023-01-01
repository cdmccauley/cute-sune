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

import useMediaQuery from "@mui/material/useMediaQuery";

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

  const compact = useMediaQuery("(max-width:720px)");
  const truncate32 = useMediaQuery("(max-width:560px)");
  const truncate24 = useMediaQuery("(max-width:480px)");
  const truncate16 = useMediaQuery("(max-width:400px)");

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
            <Link
              sx={{ marginInlineEnd: 1.5 }}
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
            <Link
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              noWrap
              variant="h6"
              underline="none"
              href={props.url}
              target="_blank"
              rel="noopener"
            >
              {truncate16 && loopringData.metadataJson.name.length > 15
                ? loopringData.metadataJson.name.slice(0, 13).padEnd(16, ".")
                : truncate24 && loopringData.metadataJson.name.length > 23
                ? loopringData.metadataJson.name.slice(0, 21).padEnd(24, ".")
                : truncate32 && loopringData.metadataJson.name.length > 31
                ? loopringData.metadataJson.name.slice(0, 29).padEnd(32, ".")
                : loopringData.metadataJson.name}
            </Link>

            {!compact ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexGrow: 1,
                }}
              >
                <EthIcon sx={{ mt: 0.5, mr: 1 }} htmlColor="#7F38EC" />
                <Typography
                  sx={{ mr: 1, minWidth: "64.95px" }}
                  variant="h6"
                  gutterBottom={false}
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
                >
                  {ordersData && ordersData.length > 0
                    ? `${ordersData.length.toString().padStart(4, " ")}/`
                    : "".padStart(2, " ")}
                  {`${Number.parseInt(loopringData.amount)}`}
                </Typography>
              </Box>
            ) : undefined}
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

      {compact ? (
        <CardContent sx={{ pt: 0, pb: "16px !important" }}>
          <Box sx={{ display: "flex" }}>
            <EthIcon sx={{ mr: 1 }} htmlColor="#7F38EC" />
            <Typography sx={{ mr: 1 }} variant="body1" gutterBottom={false}>
              {`${
                ordersData.length > 0 ? ordersData[0].toFixed(4) : "- . - - - -"
              }`}
            </Typography>
            <Typography
              sx={{ minWidth: "100px", whiteSpace: "pre-wrap" }}
              variant="body1"
              gutterBottom={false}
            >
              {ordersData && ordersData.length > 0
                ? `${ordersData.length.toString().padStart(4, " ")}/`
                : "".padStart(2, " ")}
              {`${Number.parseInt(loopringData.amount)}`}
            </Typography>
          </Box>
        </CardContent>
      ) : undefined}
    </Card>
  );
}
