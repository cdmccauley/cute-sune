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
  const [userInterval, setUserInterval] = useState(60000 * 5); // 20s

  const { parseData, parseError, parseLoading } = useParse(props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { holdersData } = useHolders(loopringData ? { loopringData } : null);

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  useEffect(() => {
    localStorage.setItem(props.url, JSON.stringify([]));
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
      props.setChildMetaData((prevState) => {
        return {
          ...prevState,
          ...{ [props.url]: { val: ordersData[0] } },
        };
      });
    } else if (!ordersData.length == 0) {
      localStorage.setItem(props.url, JSON.stringify(ordersData));
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
              sx={{ marginInlineEnd: 1.5 }}
              underline="none"
              href={props.url}
              target="_blank"
              rel="noopener"
            >
              <Image
                sx={{ borderRadius: 1 }}
                height="32px"
                width="auto"
                src={`https://www.gstop-content.com/ipfs/${
                  loopringData
                    ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
                    : undefined
                }`}
                alt={`${loopringData.metaData.name}`}
              />
            </Link>

            <Link
              variant="h6"
              underline="none"
              href={props.url}
              target="_blank"
              rel="noopener"
            >
              {`${loopringData.metaData.name}`}
            </Link>

            <Box
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
                sx={{ ml: 2 }}
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
            </Box>
          </Box>
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
      {/* <Box sx={{ display: "flex" }}>
        <CardMedia
          sx={{ height: 64, width: "auto" }}
          component="img"
          image={`https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
              : undefined
          }`}
          alt={loopringData.metaData.name}
        />
        
        <CardContent sx={{ pt: 0 }}>
          <Typography component="div">
            {loopringData
              ? loopringData.metaData.description.length > 128
                ? `${loopringData.metaData.description.slice(0, 128)}...`
                : loopringData.metaData.description
              : undefined}
          </Typography>
        </CardContent>
      </Box> */}
    </Card>
  );
}
