import { useCallback, useEffect, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";

import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import Monitor from "./monitor";
import Detail from "./detail";

export default function Footer({ props }) {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);

  const [detailGsURL, setDetailGSURL] = useState(null);

  const [childMetaData, setChildMetaData] = useState({});
  const [childComponents, setChildComponents] = useState([]);

  const [soundOff, setSoundOff] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    setInputValue("");
  };
  const handleClose = () => {
    setOpen(false);
    setDetailGSURL(null);
  };

  useEffect(() => {
    if (localStorage.getItem("gsURLs"))
      setGSURLs(JSON.parse(localStorage.getItem("gsURLs")));
    Notification.requestPermission().then((res) => {
      setNotifyAll(res === "granted");
    });
  }, []);

  // useEfct(() => {
  //   console.log("notifyAll", notifyAll);
  // }, [notifyAll]);

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
    if (detailGsURL) handleOpen();
  }, [detailGsURL]);

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
            notify: notifyAll,
            keyPair: props.keyPair,
            session: props.session,
            signature: props.signature,
          }}
          key={index}
        />
      ))
    );
  }, [gsURLs, notifyAll]);

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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          {detailGsURL ? (
            <Detail
              props={{
                gsURL: detailGsURL,
                // if monitoring send default notify
                notify: gsURLs.includes(detailGsURL) ? notifyAll : false,
                keyPair: props.keyPair,
                session: props.session,
                signature: props.signature,
              }}
            />
          ) : undefined}
        </Box>
      </Modal>
      <Stack sx={{ m: 2, mb: "80px" }} spacing={2}>
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
          {!notifyAll ? (
            <IconButton
              onClick={() => {
                Notification.requestPermission().then((res) => {
                  setNotifyAll(res === "granted");
                });
              }}
              color="inherit"
            >
              <NotificationsActiveIcon />
            </IconButton>
          ) : undefined}
          <IconButton
            onClick={() => {
              setGSURL(inputValue);
            }}
            color="inherit"
          >
            <PlaylistAddIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setDetailGSURL(inputValue);
            }}
            color="inherit"
          >
            <QueryStatsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
