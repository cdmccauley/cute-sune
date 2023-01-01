import { useCallback, useEffect, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Header({ props }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🧹🧹🧹
          </Typography>
          <Button
            disabled={props.connecting}
            variant="outlined"
            onClick={() =>
              props.wallet ? props.disconnect(props.wallet) : props.connect()
            }
          >
            {props.connecting
              ? "connecting"
              : props.wallet
              ? "disconnect"
              : "connect"}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
