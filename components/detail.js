import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import Display from "../components/display";
import Monitor from "../components/monitor";
import History from "../components/history";

import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";
import useHistory from "../data/use-history";

import parse from "../lib/parse";

export default function Detail({ props }) {
  const [limitMethod, setLimitMethod] = useState("INDEX");
  const [userInterval, setUserInterval] = useState(60000); // 60s

  const parseData = parse(props.gsURL);

  const config = props.config;
  const keyPair = props.keyPair;
  const session = props.session;
  const signature = props.signature;

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData, keyPair, session, signature } : null
  );

  const { historyData, historyError, historyLoading } = useHistory(
    loopringData && loopringData.loopringNftInfo
      ? {
          nft: loopringData.loopringNftInfo.nftData,
          keyPair,
          session,
          signature,
        }
      : undefined
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  return (
    <Container sx={{ minWidth: "100%" }}>
      <Stack sx={{ mt: 3, mb: 2 }} spacing={1.5}>
        {props.gsURL ? (
          <Card raised={true}>
            <Monitor
              props={{
                config: config,
                url: props.gsURL,
                index: 0,
                notify: props.notify,
                keyPair: props.keyPair,
                session: props.session,
                signature: props.signature,
              }}
            />
          </Card>
        ) : undefined}

        {ordersData && historyData ? (
          <Card raised={true} sx={{ p: 2 }}>
            <CardContent sx={{ display: "flex", gap: 4 }}>
              {historyData ? (
                <Box sx={{ width: "100%" }}>
                  <Typography>{`${config.discovered}${
                    historyData.filter(
                      (o) =>
                        o.transaction.orderA &&
                        (parseFloat(o.transaction.orderA.amountS) * 1e-18) /
                          parseFloat(o.transaction.orderA.amountB) <
                          3
                    ).length
                  })`}</Typography>
                  <History props={{ history: historyData }} />
                </Box>
              ) : undefined}
              {ordersData && ordersData[0] ? (
                <Box sx={{ width: "100%" }}>
                  <Typography>{`${config.listed}${
                    limitMethod == "INDEX"
                      ? config.first
                      : limitMethod == "PERCENT"
                      ? config.upto
                      : config.all
                  })`}</Typography>
                  <Display
                    props={{
                      ordersData: ordersData,
                      limitMethod: limitMethod,
                    }}
                  />
                </Box>
              ) : (
                <Typography>{`${config.listed}0)`}</Typography>
              )}
            </CardContent>
          </Card>
        ) : undefined}

        <Card raised={true}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", gap: 2 }}>
                {ordersData && ordersData[0] ? (
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={limitMethod == "INDEX"}
                          onChange={(e) => {
                            if (e.target.checked) setLimitMethod("INDEX");
                          }}
                        />
                      }
                      label="Index"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={limitMethod == "PERCENT"}
                          onChange={(e) => {
                            if (e.target.checked) setLimitMethod("PERCENT");
                          }}
                        />
                      }
                      label="Percent"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={limitMethod == "MAX"}
                          onChange={(e) => {
                            if (e.target.checked) setLimitMethod("MAX");
                          }}
                        />
                      }
                      label="Max"
                    />
                  </FormGroup>
                ) : undefined}
              </Box>
            }
            action={
              <IconButton
                aria-label="remove"
                onClick={() => {
                  //
                }}
              >
                <MoreVertIcon sx={{ height: 24, width: 24 }} />
              </IconButton>
            }
          />
        </Card>
      </Stack>
    </Container>
  );
}
