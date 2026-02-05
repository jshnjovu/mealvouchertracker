import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { VoucherEntry } from "../services/api";
import { formatTime } from "../utils/timeFormat";

export default function VoucherPreview({ entry }: { entry: VoucherEntry }) {
  return (
    <Card 
      variant="outlined"
      sx={{
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)"
        }
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Employee
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {entry.employee_name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {entry.employee_id}
            </Typography>
          </Box>

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AccessTimeIcon color="primary" fontSize="small" />
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Time In
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={500}>
                {formatTime(entry.time_in)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AccessTimeIcon color="primary" fontSize="small" />
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Time Out
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={500}>
                {formatTime(entry.time_out)}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={entry.time_out ? "Complete" : "Open"}
              color={entry.time_out ? "success" : "warning"}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={entry.synced ? "Synced" : "Pending"}
              color={entry.synced ? "success" : "info"}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
