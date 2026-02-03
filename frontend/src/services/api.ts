export const API_BASE = "http://192.168.1.13:8000";

export type Employee = {
  employee_id: string;
  name: string;
  department?: string | null;
  is_active: boolean;
};

export type VoucherEntry = {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  time_in: string;
  time_out?: string | null;
  voucher_printed: boolean;
  synced: boolean;
};

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/api/employees`);
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
}

export async function checkIn(employee_id: string, employee_name?: string) {
  const res = await fetch(`${API_BASE}/api/vouchers/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id, employee_name })
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<VoucherEntry>;
}

export async function checkOut(employee_id: string) {
  const res = await fetch(`${API_BASE}/api/vouchers/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id })
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<VoucherEntry>;
}

export async function fetchVouchers(): Promise<VoucherEntry[]> {
  const res = await fetch(`${API_BASE}/api/vouchers`);
  if (!res.ok) {
    throw new Error("Failed to fetch vouchers");
  }
  return res.json();
}

export async function verifyPin(pin: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) {
    throw new Error("PIN verification failed");
  }
  return res.json() as Promise<{ valid: boolean }>;
}

export async function importEmployees(file: File, pin: string) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/employees/import`, {
    method: "POST",
    headers: { "X-Admin-PIN": pin },
    body: form
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{ created: number; updated: number }>;
}

export async function fetchDailyReport(reportDate: string, pin: string) {
  const res = await fetch(
    `${API_BASE}/api/reports/daily?report_date=${encodeURIComponent(reportDate)}`,
    {
      headers: { "X-Admin-PIN": pin }
    }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.blob();
}
