import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Employee,
  fetchDailyReport,
  fetchEmployees,
  fetchVouchers,
  importEmployees,
  verifyPin
} from "../services/api";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => (
          <Box>
            <Typography fontWeight={600}>{info.getValue() as string}</Typography>
            <Typography variant="body2" color="text.secondary">
              {info.row.original.employee_id}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: (info) => info.getValue() || "--"
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: (info) => (
          <Chip
            label={info.getValue() ? "Active" : "Inactive"}
            color={info.getValue() ? "success" : "warning"}
            variant="outlined"
            size="small"
          />
        )
      }
    ],
    []
  );

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeFormat, setTimeFormat] = useState("");
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
      const blob = await fetchDailyReport(reportDate, pin, timeFormat || undefined);
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
              {data && data.length > 0 ? (
                <DataTable 
                  data={data} 
                  columns={columns} 
                  searchPlaceholder="Search employees..." 
                  initialSorting={[{ id: "name", desc: false }]}
                />
              ) : (
                <Alert severity="info">No employees loaded yet.</Alert>
              )}
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
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="admin-time-format-label">Time Format</InputLabel>
              <Select
                labelId="admin-time-format-label"
                id="admin-time-format-select"
                value={timeFormat}
                label="Time Format"
                onChange={(e) => setTimeFormat(e.target.value)}
              >
                <MenuItem value="">Default (ISO)</MenuItem>
                <MenuItem value="%Y-%m-%d">Date only</MenuItem>
                <MenuItem value="%H:%M">Time (H:M)</MenuItem>
                <MenuItem value="%H:%M:%S">Time (H:M:S)</MenuItem>
                <MenuItem value="%Y-%m-%d %H:%M">Date & Time</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleReportDownload}
              sx={{ flex: 1 }}
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
