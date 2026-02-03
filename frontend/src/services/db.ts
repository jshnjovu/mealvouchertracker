import Dexie, { Table } from "dexie";

export type EmployeeRecord = {
  employee_id: string;
  name: string;
  department?: string | null;
  is_active: boolean;
};

export type VoucherRecord = {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  time_in: string;
  time_out?: string | null;
  voucher_printed: boolean;
  synced: boolean;
};

class VoucherDB extends Dexie {
  employees!: Table<EmployeeRecord, string>;
  vouchers!: Table<VoucherRecord, string>;

  constructor() {
    super("mealVoucherDB");
    this.version(1).stores({
      employees: "employee_id, name, department, is_active",
      vouchers: "id, employee_id, date, synced"
    });
  }
}

export const voucherDB = new VoucherDB();

export async function cacheEmployees(records: EmployeeRecord[]) {
  await voucherDB.employees.clear();
  await voucherDB.employees.bulkPut(records);
}

export async function getCachedEmployee(employee_id: string) {
  return voucherDB.employees.get(employee_id);
}

export async function queueVoucher(record: VoucherRecord) {
  await voucherDB.vouchers.put(record);
}

export async function listQueuedVouchers() {
  return voucherDB.vouchers.filter((v) => v.synced === false).toArray();
}

export async function markVoucherSynced(id: string) {
  await voucherDB.vouchers.update(id, { synced: true });
}

export async function findOpenVoucher(employee_id: string) {
  return voucherDB.vouchers
    .where("employee_id")
    .equals(employee_id)
    .filter((record) => !record.time_out)
    .last();
}

export async function updateVoucher(id: string, updates: Partial<VoucherRecord>) {
  await voucherDB.vouchers.update(id, updates);
}
