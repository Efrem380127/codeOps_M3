/**
 * Meds Addis — accounts.
 *
 * Passwords are stored as SHA-256 digests, never in clear text. lib/auth.js
 * hashes the submitted password and compares digests.
 *
 * These are demo fixtures. A real deployment moves this to a users table with
 * per-user salts and an adaptive hash (bcrypt/argon2) — see FUTURE.md.
 */

export const ROLES = {
  CUSTOMER: "customer",
  PHARMACIST: "pharmacist",
  MANAGER: "manager",
};

/** sha256("meds2026") — every demo account shares it, and the sign-in page says so. */
const DEMO_HASH =
  "afc7451876b862ad04b8bae075e5da268a42f86fc65712e11ad937078a406649";

export const users = [
  {
    id: "usr_abebe",
    name: "Abebe Bikila",
    email: "abebe@medsaddis.et",
    passwordHash: DEMO_HASH,
    role: ROLES.CUSTOMER,
    phone: "0911223344",
    address: "Bole Atlas, House 402, Addis Ababa",
  },
  {
    id: "usr_chala",
    name: "Chala Kebede",
    email: "chala@medsaddis.et",
    passwordHash: DEMO_HASH,
    role: ROLES.CUSTOMER,
    phone: "0922334455",
    address: "Mexico Square, Block C, Addis Ababa",
  },
  {
    id: "usr_sara",
    name: "Sara Tesfaye",
    email: "sara@medsaddis.et",
    passwordHash: DEMO_HASH,
    role: ROLES.CUSTOMER,
    phone: "0933445566",
    address: "Kazanchis, Ring Road, Addis Ababa",
  },
  {
    id: "usr_meron",
    name: "Meron Alemu",
    email: "meron@medsaddis.et",
    passwordHash: DEMO_HASH,
    role: ROLES.PHARMACIST,
    phone: "0944556677",
    address: "Meds Addis — Bole Branch",
    licenceNumber: "EFDA-PH-2019-4471",
  },
  {
    id: "usr_dawit",
    name: "Dawit Haile",
    email: "dawit@medsaddis.et",
    passwordHash: DEMO_HASH,
    role: ROLES.MANAGER,
    phone: "0955667788",
    address: "Meds Addis — Head Office",
  },
];

export function findUserById(id) {
  return users.find((user) => user.id === id) ?? null;
}

export function findUserByEmail(email) {
  const needle = String(email ?? "").trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === needle) ?? null;
}

/** Staff = anyone who may work the dispensary or open the manager dashboard. */
export function isStaff(user) {
  return user?.role === ROLES.PHARMACIST || user?.role === ROLES.MANAGER;
}
