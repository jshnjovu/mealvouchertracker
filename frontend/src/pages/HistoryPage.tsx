import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { fetchDailyReport, fetchVouchers, VoucherEntry } from "../services/api";
import { formatTime } from "../utils/timeFormat";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vouchers"],
    queryFn: fetchVouchers
  });

  const columns = useMemo<ColumnDef<VoucherEntry>[]>(
    () => [
      {
        accessorKey: "employee_name",
        header: "Employee",
        cell: (info) => (
          <Box>
            <Typography fontWeight={600}>{info.row.original.employee_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {info.row.original.employee_id}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: "time_in",
        header: "Time In",
        cell: (info) => formatTime(info.getValue() as string)
      },
      {
        accessorKey: "time_out",
        header: "Time Out",
        cell: (info) => formatTime(info.getValue() as string)
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Chip
            label={info.row.original.time_out ? "Complete" : "Open"}
            color={info.row.original.time_out ? "success" : "warning"}
            size="small"
            variant="outlined"
          />
        )
      }
    ],
    []
  );

  const availableDates = Array.from(new Set((data ?? []).map((entry) => entry.date)))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pin, setPin] = useState("");
  const [timeFormat, setTimeFormat] = useState("");
  const [reportStatus, setReportStatus] = useState<
    { text: string; severity: "success" | "error" | "info" | "warning" } | null
  >(null);

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
          Daily History
        </Typography>
        <Typography color="text.secondary">
          Track check-ins and check-outs across the day.
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {isLoading ? <Alert severity="info">Loading vouchers...</Alert> : null}
        {error ? <Alert severity="error">Unable to load history.</Alert> : null}
        {!isLoading && data && data.length === 0 ? (
          <Alert severity="info">No voucher activity yet.</Alert>
        ) : null}
        {data && data.length > 0 ? (
          <DataTable 
            data={data} 
            columns={columns} 
            searchPlaceholder="Search employees..." 
            initialSorting={[{ id: "time_in", desc: true }]}
          />
        ) : null}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">Download Daily Report</Typography>
            <Typography color="text.secondary">
              Requires admin PIN. Generates a CSV for the selected date.
            </Typography>
          </Box>

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
            <TextField
              label="Admin PIN"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter admin PIN"
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="history-time-format-label">Time Format</InputLabel>
              <Select
                labelId="history-time-format-label"
                id="history-time-format-select"
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
              Download CSV
            </Button>
          </Stack>

          {reportStatus ? (
            <Alert severity={reportStatus.severity}>{reportStatus.text}</Alert>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
