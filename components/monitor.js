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
import useHolders from "../data/use-holders";

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
    if (props.setChildMetaData)
      props.setChildMetaData((prevState) => {
        return {
          ...prevState,
          ...{ [props.url]: { val: 0 } },
        };
      });
  }, []);

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
      if (props.setSoundOff) props.setSoundOff(true);

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

  if (parseError || loopringError || ordersError)
    return (
      <Card raised={true}>
        <CardContent sx={{ pt: 0 }}>
          <Typography component="div">Failed to load</Typography>
        </CardContent>
      </Card>
    );
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
              sx={{ display: "flex", marginInlineEnd: 1.5 }}
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
              variant="h6"
              underline="none"
              href={props.url}
              target="_blank"
              rel="noopener"
            >
              {`${loopringData.metadataJson.name}`}
            </Link>

            {/* <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                flexGrow: 1,
                mr: 0.5,
              }}
            >
              {ordersData.length > 0 ? (
                <EthIcon sx={{ mt: 0.5, mr: 1 }} />
              ) : undefined}

              <Typography
                variant="h6"
                component="div"
                hidden={!ordersData.length > 0}
              >
                {`${
                  ordersData.length > 0 ? ordersData[0].toFixed(4) : undefined
                }`}
              </Typography>
              <Typography
                sx={{ ml: 2, minWidth: 76 }}
                variant="h6"
                component="div"
                hidden={!ordersData.length > 0}
              >
                {`${ordersData ? ordersData.length : 0}/${
                  holdersData
                    ? holdersData.nftHolders.reduce(
                        (a, curr) => a + Number.parseInt(curr.amount),
                        0
                      )
                    : ".."
                }`}
              </Typography>
            </Box> */}
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
      <CardContent sx={{ pt: 0, pb: "16px !important" }}>
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
      </CardContent>
      {/* <Box sx={{ display: "flex" }}>
        <CardMedia
          sx={{ height: 64, width: "auto" }}
          component="img"
          image={`https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metadataJson.image.match(/(?<=.{7}).+/i)
              : undefined
          }`}
          alt={loopringData.metadataJson.name}
        />
        
        <CardContent sx={{ pt: 0 }}>
          <Typography component="div">
            {loopringData
              ? loopringData.metadataJson.description.length > 128
                ? `${loopringData.metadataJson.description.slice(0, 128)}...`
                : loopringData.metadataJson.description
              : undefined}
          </Typography>
        </CardContent>
      </Box> */}
    </Card>
  );
}
