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

import MoreVertIcon from "@mui/icons-material/MoreVert";

import Display from "../components/display";
import Monitor from "../components/monitor";
import History from "../components/history";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";
import useHistory from "../data/use-history";

export default function Detail({ props }) {
  const [gsURL, setGSURL] = useState(null);
  const [limitMethod, setLimitMethod] = useState("INDEX");
  const [userInterval, setUserInterval] = useState(60000); // 60s

  useEffect(() => {
    setGSURL(props.gsURL);
  }, [props.gsURL]);

  const { parseData, parseError, parseLoading } = useParse(
    gsURL ? gsURL : null
  );

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { historyData, historyError, historyLoading } = useHistory(
    loopringData && loopringData.loopringNftInfo
      ? { nft: loopringData.loopringNftInfo.nftData }
      : undefined
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  return (
    <Container sx={{ minWidth: "100%" }}>
      <Stack sx={{ mt: 3, mb: 2 }} spacing={3}>
        {gsURL ? (
          <Card raised={true}>
            <Monitor
              props={{
                url: gsURL,
                index: 0,
                notify: props.notify,
              }}
            />
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
                  console.log("menu?");
                  const { ethereum } = window;
                  console.log(ethereum)
                }}
              >
                <MoreVertIcon sx={{ height: 24, width: 24 }} />
              </IconButton>
            }
          />
        </Card>

        {ordersData && historyData ? (
          <Card raised={true} sx={{ p: 2 }}>
            <CardContent sx={{ display: "flex", gap: 4 }}>
              {historyData ? (
                <Box sx={{ width: "100%" }}>
                  <Typography>{`Discovered Sales (${
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
                  <Typography>{`Listings (${
                    limitMethod == "INDEX"
                      ? "First 10"
                      : limitMethod == "PERCENT"
                      ? "Up to 250% current price"
                      : "All"
                  })`}</Typography>
                  <Display
                    props={{
                      ordersData: ordersData,
                      limitMethod: limitMethod,
                    }}
                  />
                </Box>
              ) : (
                <Typography>{`Listings (0)`}</Typography>
              )}
            </CardContent>
          </Card>
        ) : undefined}
      </Stack>
    </Container>
  );
}
