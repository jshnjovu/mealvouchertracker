import { useState, useCallback } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info"
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({
      open: true,
      message,
      severity: type as AlertColor
    });
  }, []);

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const ToastProvider = () => (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          borderRadius: 2
        }
      }}
    >
      <Alert
        onClose={handleClose}
        severity={toast.severity}
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 4,
          "& .MuiAlert-icon": {
            fontSize: 24
          }
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );

  return { showToast, ToastProvider };
}
