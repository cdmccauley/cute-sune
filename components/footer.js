import { useCallback, useEffect, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import Monitor from "../components/monitor";

export default function Footer({ props }) {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);

  const [childMetaData, setChildMetaData] = useState({});
  const [childComponents, setChildComponents] = useState([]);

  const [soundOff, setSoundOff] = useState(false);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gsURLs"))
      setGSURLs(JSON.parse(localStorage.getItem("gsURLs")));
    if (!("Notification" in window) || Notification.permission === "granted")
      setNotify(true);
  }, []);

  useEffect(() => {
    if (
      new RegExp("https://nft.gamestop.com/token/0x[a-zA-Z0-9]*/0x").test(
        gsURL
      ) &&
      !gsURLs.includes(gsURL)
    ) {
      setGSURLs([...gsURLs, gsURL]);
      localStorage.setItem("gsURLs", JSON.stringify([...gsURLs, gsURL]));
    } else {
      // invalid or existing, alert
    }
    setInputValue("");
    setGSURL("");
  }, [gsURL]);

  useEffect(() => {
    setChildComponents(
      gsURLs.map((url, index) => (
        <Monitor
          props={{
            url,
            setSoundOff,
            gsURLs,
            setGSURLs,
            index,
            childMetaData,
            setChildMetaData,
          }}
          key={index}
        />
      ))
    );
  }, [gsURLs]);

  useEffect(() => {
    if (
      gsURLs.toString() !=
      gsURLs
        .sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        .toString()
    ) {
      localStorage.setItem(
        "gsURLs",
        JSON.stringify(
          gsURLs.sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        )
      );
      setGSURLs(
        Array.from(
          gsURLs.sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        )
      );
    }
  }, [childMetaData]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack sx={{ m: 2 }} spacing={2}>
        {childComponents.map((childComponent) => childComponent)}
      </Stack>
      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar sx={{ pr: 0 }}>
          <Box sx={{ flexGrow: 1, pr: 1.5 }}>
            <TextField
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              fullWidth
              size="small"
              label="URL"
              variant="outlined"
            />
          </Box>
          <IconButton
            onClick={() => {
              setGSURL(inputValue);
            }}
            color="inherit"
          >
            <PlaylistAddIcon />
          </IconButton>
          <IconButton color="inherit">
            <QueryStatsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
