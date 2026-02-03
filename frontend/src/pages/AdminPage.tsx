import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DownloadIcon from "@mui/icons-material/Download";
import {
  fetchDailyReport,
  fetchEmployees,
  fetchVouchers,
  importEmployees,
  verifyPin
} from "../services/api";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportStatus, setReportStatus] = useState<
    { text: string; severity: "success" | "error" | "info" | "warning" } | null
  >(null);

  const { data } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees
  });

  const voucherDatesQuery = useQuery({
    queryKey: ["voucher-dates"],
    queryFn: fetchVouchers
  });

  const availableDates = Array.from(
    new Set((voucherDatesQuery.data ?? []).map((entry) => entry.date))
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  const pinMutation = useMutation({
    mutationFn: () => verifyPin(pin),
    onSuccess: (result) => {
      setVerified(result.valid);
      setMessage(result.valid ? "PIN verified." : "Invalid PIN.");
    },
    onError: () => setMessage("PIN verification failed.")
  });

  const importMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Select a CSV file to import.");
      }
      if (!verified) {
        throw new Error("Verify admin PIN first.");
      }
      return importEmployees(selectedFile, pin);
    },
    onSuccess: (result) => {
      setMessage(`Imported ${result.created} new, updated ${result.updated}.`);
      setSelectedFile(null);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : "Import failed.");
    }
  });

  const handleReportDownload = async () => {
    try {
      setReportStatus(null);
      if (!pin) {
        setReportStatus({
          text: "Enter admin PIN to download the report.",
          severity: "warning"
        });
        return;
      }
      const blob = await fetchDailyReport(reportDate, pin);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `voucher_report_${reportDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setReportStatus({ text: "Report downloaded.", severity: "success" });
    } catch (err) {
      setReportStatus({
        text: err instanceof Error ? err.message : "Report download failed.",
        severity: "error"
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Control
        </Typography>
        <Typography color="text.secondary">
          Manage roster, imports, and report downloads.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Verify Admin PIN</Typography>
              <TextField
                label="PIN Code"
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="Enter admin PIN"
              />
              <Button
                variant="contained"
                startIcon={<VpnKeyIcon />}
                onClick={() => pinMutation.mutate()}
              >
                Verify PIN
              </Button>
              {verified ? <Alert severity="success">Verified</Alert> : null}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">CSV Import</Typography>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                {selectedFile ? "Change CSV" : "Choose CSV"}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </Button>
              {selectedFile ? (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
              ) : null}
              <Button variant="contained" onClick={() => importMutation.mutate()}>
                Import Employees
              </Button>
              <Typography variant="body2" color="text.secondary">
                Required columns: employee_id, name. Optional: department, is_active.
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Employee Snapshot</Typography>
              <Stack spacing={1}>
                {data?.slice(0, 6).map((employee) => (
                  <Box
                    key={employee.employee_id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "grey.50"
                    }}
                  >
                    <div>
                      <Typography fontWeight={600}>{employee.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.employee_id}
                      </Typography>
                    </div>
                    <Chip
                      label={employee.is_active ? "Active" : "Inactive"}
                      color={employee.is_active ? "success" : "warning"}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                ))}
                {!data?.length ? (
                  <Alert severity="info">No employees loaded yet.</Alert>
                ) : null}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Daily Report</Typography>
          <Typography color="text.secondary">
            Download CSV reports with the verified admin PIN.
          </Typography>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Available Dates
            </Typography>
            {availableDates.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {availableDates.map((date) => (
                  <Chip
                    key={date}
                    label={date}
                    variant={date === reportDate ? "filled" : "outlined"}
                    color={date === reportDate ? "primary" : "default"}
                    onClick={() => setReportDate(date)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            ) : (
              <Alert severity="info">No voucher data yet, so no reports are available.</Alert>
            )}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Report Date"
              type="date"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleReportDownload}
            >
              Download Report
            </Button>
          </Stack>
          {reportStatus ? (
            <Alert severity={reportStatus.severity}>{reportStatus.text}</Alert>
          ) : null}
        </Stack>
      </Paper>

      {message ? (
        <Alert severity={message.includes("failed") || message.includes("Invalid") ? "error" : "info"}>
          {message}
        </Alert>
      ) : null}
    </Stack>
  );
}
