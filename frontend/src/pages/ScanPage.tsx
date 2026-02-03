import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Zoom
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { checkIn, checkOut, VoucherEntry } from "../services/api";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import {
  findOpenVoucher,
  getCachedEmployee,
  queueVoucher,
  updateVoucher
} from "../services/db";
import { registerBackgroundSync } from "../services/sync";
import VoucherPreview from "../components/VoucherPreview";
import PrintVoucher from "../components/PrintVoucher";
import QrScanner from "../components/QrScanner";

export default function ScanPage() {
  const [mode, setMode] = useState<"in" | "out">("in");
  const [manualId, setManualId] = useState("");
  const [latest, setLatest] = useState<VoucherEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const online = useOnlineStatus();

  const mutation = useMutation({
    mutationFn: async (idValue?: string) => {
      setError(null);
      const resolved = (idValue ?? manualId).trim();
      if (!resolved) {
        throw new Error("Enter an employee ID.");
      }
      if (!online) {
        const cached = await getCachedEmployee(resolved);
        if (!cached) {
          throw new Error("Employee not found in offline cache.");
        }
        const now = new Date().toISOString();
        if (mode === "in") {
          const localEntry: VoucherEntry = {
            id: crypto.randomUUID(),
            employee_id: cached.employee_id,
            employee_name: cached.name,
            date: now.split("T")[0],
            time_in: now,
            time_out: null,
            voucher_printed: false,
            synced: false
          };
          await queueVoucher(localEntry);
          await registerBackgroundSync();
          return localEntry;
        }
        const open = await findOpenVoucher(resolved);
        if (!open) {
          throw new Error("No open voucher found offline.");
        }
        await updateVoucher(open.id, { time_out: now, synced: false });
        await registerBackgroundSync();
        return { ...open, time_out: now, synced: false } as VoucherEntry;
      }
      return mode === "in" ? checkIn(resolved) : checkOut(resolved);
    },
    onSuccess: (data) => {
      setLatest(data);
      setManualId("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  return (
    <Fade in timeout={600}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Scan & Validate
          </Typography>
          <Typography color="text.secondary" variant="body1">
            Scan a QR code or type an employee ID to check in or out.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Zoom in timeout={400}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    elevation: 4
                  }
                }}
              >
                <Stack spacing={3}>
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, value) => value && setMode(value)}
                    aria-label="check-in mode"
                    fullWidth
                    sx={{
                      "& .MuiToggleButton-root": {
                        flex: 1,
                        py: 1.5,
                        fontSize: "1rem"
                      }
                    }}
                  >
                    <ToggleButton value="in">
                      <LoginIcon sx={{ mr: 1 }} /> Check In
                    </ToggleButton>
                    <ToggleButton value="out">
                      <LogoutIcon sx={{ mr: 1 }} /> Check Out
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <QrScanner
                    onScan={(value) => {
                      setManualId(value);
                      mutation.mutate(value);
                    }}
                  />

                  <Stack spacing={2}>
                    <TextField
                      label="Manual ID"
                      value={manualId}
                      onChange={(event) => setManualId(event.target.value)}
                      placeholder="e.g. EMP-1024"
                      fullWidth
                      disabled={mutation.isPending}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !mutation.isPending) {
                          mutation.mutate(undefined);
                        }
                      }}
                    />
                    {mutation.isPending && (
                      <LinearProgress 
                        sx={{ 
                          borderRadius: 1,
                          height: 6
                        }} 
                      />
                    )}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        mutation.isPending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : mutation.isSuccess && latest ? (
                          <CheckCircleIcon />
                        ) : (
                          <QrCodeScannerIcon />
                        )
                      }
                      onClick={() => mutation.mutate(undefined)}
                      disabled={mutation.isPending}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600
                      }}
                    >
                      {mutation.isPending
                        ? "Processing..."
                        : mode === "in"
                          ? "Record Check In"
                          : "Record Check Out"}
                    </Button>
                    {error && (
                      <Zoom in timeout={300}>
                        <Alert 
                          severity="error"
                          sx={{
                            borderRadius: 2,
                            "& .MuiAlert-icon": {
                              fontSize: 24
                            }
                          }}
                        >
                          {error}
                        </Alert>
                      </Zoom>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Zoom>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Zoom in timeout={500}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3, 
                  height: "100%",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    elevation: 4
                  }
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Latest Activity
                  </Typography>
                  {latest ? (
                    <Fade in timeout={400}>
                      <Box>
                        <VoucherPreview entry={latest} />
                      </Box>
                    </Fade>
                  ) : (
                    <Alert 
                      severity="info"
                      sx={{
                        borderRadius: 2,
                        "& .MuiAlert-icon": {
                          fontSize: 24
                        }
                      }}
                    >
                      No scans yet. Scan to generate a voucher preview.
                    </Alert>
                  )}
                  {latest && latest.time_out && (
                    <Fade in timeout={400}>
                      <Box>
                        <PrintVoucher entry={latest} />
                      </Box>
                    </Fade>
                  )}
                  <Alert 
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        fontSize: 24
                      }
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      Tip: Keep the device steady and align the QR code within the frame.
                    </Typography>
                  </Alert>
                </Stack>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Stack>
    </Fade>
  );
}
