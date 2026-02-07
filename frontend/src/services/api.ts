// Use empty string for relative paths (when behind nginx proxy), fallback to localhost for dev
// If VITE_API_URL is set to the current origin, use relative paths to go through nginx proxy
const envApiUrl = import.meta.env.VITE_API_URL;
const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";

// Use relative paths if:
// 1. VITE_API_URL is empty or "/"
// 2. VITE_API_URL matches the current origin (same domain, so use nginx proxy)
// Otherwise use the provided URL or fallback to localhost for dev
export const API_BASE = 
  envApiUrl === "" || 
  envApiUrl === "/" || 
  (envApiUrl && currentOrigin && envApiUrl.startsWith(currentOrigin))
    ? "" 
    : (envApiUrl || "http://localhost:8000");

if (typeof window !== "undefined") {
  console.log(`[API] Base set to: "${API_BASE}" (VITE_API_URL: "${envApiUrl}", Origin: "${currentOrigin}")`);
}

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
  const url = `${API_BASE}/api/vouchers`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API] Failed to fetch vouchers from ${url}: ${res.status} ${res.statusText}`);
      throw new Error("Failed to fetch vouchers");
    }
    return res.json();
  } catch (error) {
    console.error(`[API] Error fetching vouchers from ${url}:`, error);
    throw error;
  }
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

export async function fetchDailyReport(reportDate: string, pin: string, timeFormat?: string) {
  let url = `${API_BASE}/api/reports/daily?report_date=${encodeURIComponent(reportDate)}`;
  if (timeFormat) {
    url += `&time_format=${encodeURIComponent(timeFormat)}`;
  }
  
  const res = await fetch(
    url,
    {
      headers: { "X-Admin-PIN": pin }
    }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.blob();
}
