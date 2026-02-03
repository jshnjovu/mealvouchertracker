import { Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { VoucherEntry } from "../services/api";

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

export default function PrintVoucher({ entry }: { entry: VoucherEntry }) {
  const handlePrint = () => {
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Voucher</title>
          <style>
            body { font-family: 'Space Grotesk', sans-serif; padding: 24px; }
            h2 { margin: 0 0 12px; }
            .row { margin-bottom: 12px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #555; }
            .value { font-size: 16px; font-weight: 600; }
          </style>
        </head>
        <body>
          <h2>Meal Voucher</h2>
          <div class="row">
            <div class="label">Employee</div>
            <div class="value">${entry.employee_name} (${entry.employee_id})</div>
          </div>
          <div class="row">
            <div class="label">Time In</div>
            <div class="value">${formatDate(entry.time_in)}</div>
          </div>
          <div class="row">
            <div class="label">Time Out</div>
            <div class="value">${formatDate(entry.time_out)}</div>
          </div>
          <div class="row">
            <div class="label">Date</div>
            <div class="value">${entry.date}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
      Print Voucher
    </Button>
  );
}
