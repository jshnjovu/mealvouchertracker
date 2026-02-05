import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { fetchDailyReport, fetchVouchers } from "../services/api";
import { formatTime } from "../utils/timeFormat";

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vouchers"],
    queryFn: fetchVouchers
  });

  const availableDates = Array.from(new Set((data ?? []).map((entry) => entry.date)))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pin, setPin] = useState("");
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{entry.employee_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.employee_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatTime(entry.time_in)}</TableCell>
                    <TableCell>{formatTime(entry.time_out)}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.time_out ? "Complete" : "Open"}
                        color={entry.time_out ? "success" : "warning"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
            />
            <TextField
              label="Admin PIN"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter admin PIN"
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleReportDownload}
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
