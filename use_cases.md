# Meal Voucher Tracker: Current Use Cases

The current implementation of the Meal Voucher Tracker serves as a robust **Attendance and Verification** tool. Below are the primary ways the system can be used in its current state:

## 1. High-Volume Employee Enrollment
*   **Action:** Bulk import 400+ employees using a CSV file via the Admin panel.
*   **Outcome:** Instantly establishes a "Master Table" of authorized personnel, categorized by department. This replaces manual entry and ensures data consistency across the organization.

## 2. Reliable On-Site QR Scanning
*   **Action:** Use a tablet or mobile device at the cafeteria entrance to scan QR codes on employee badges.
*   **Outcome:** 
    *   **Real-time Validation:** Checks if the scanned ID exists in the master list.
    *   **Offline Resilience:** If the internet fails, the PWA stores scans locally in IndexedDB and automatically syncs them to the server once connectivity is restored. This ensures zero data loss during high-traffic meal times.

## 3. Daily Attendance Auditing & Compliance
*   **Action:** Access the automatically generated daily CSV reports (scheduled for 18:00 by default) or download them via the Admin PIN.
*   **Outcome:** Provides a verifiable audit trail of exactly who ate and at what time. This is essential for preventing unauthorized meal consumption and for basic headcount tracking.

## 4. Manual Fallback & Physical Vouchers
*   **Action:** Manually check in an employee by ID (e.g., if a badge is lost) and use the "Print Voucher" feature.
*   **Outcome:** Generates a physical slip that can be handed to kitchen staff, providing a backup process that keeps the cafeteria line moving without compromising record-keeping.

## 5. Department-Level Tracking
*   **Action:** Filter or sort the generated daily reports by the `department` field.
*   **Outcome:** Allows management to see which departments are the highest users of the cafeteria on any given day, providing preliminary data for organizational planning.
