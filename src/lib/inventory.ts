import { useSyncExternalStore } from "react";

export type OpType = "IN" | "OUT";
export type OpStatus = "draft" | "waiting" | "ready" | "done" | "cancelled";

export interface Product {
  id: string;
  sku: string;
  name: string;
  cost: number;
  onHand: number;
}
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
}
export interface Location {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
}
export interface OpLine {
  productId: string;
  qty: number;
}
export interface Operation {
  id: string;
  type: OpType;
  ref: string;
  contact: string;
  from: string;
  to: string;
  scheduleDate: string;
  responsible: string;
  status: OpStatus;
  lines: OpLine[];
}
export interface Move {
  id: string;
  ref: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  productId: string;
  qty: number;
  direction: "in" | "out";
}
export interface User {
  loginId: string;
  email: string;
  password: string;
}

export interface State {
  products: Product[];
  warehouses: Warehouse[];
  locations: Location[];
  operations: Operation[];
  moves: Move[];
  users: User[];
  session: string | null;
}

const KEY = "stocksense:v1";
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const seed: State = {
  products: [
    { id: "p1", sku: "DESK001", name: "Desk", cost: 3000, onHand: 50 },
    { id: "p2", sku: "TABL001", name: "Table", cost: 3000, onHand: 50 },
    { id: "p3", sku: "CHAI001", name: "Office Chair", cost: 1800, onHand: 12 },
    { id: "p4", sku: "SHLF001", name: "Shelf Unit", cost: 2200, onHand: 0 },
  ],
  warehouses: [{ id: "w1", name: "Main Warehouse", code: "WH", address: "Plot 12, Industrial Area, Pune" }],
  locations: [
    { id: "l1", name: "Stock 1", code: "Stock1", warehouseId: "w1" },
    { id: "l2", name: "Stock 2", code: "Stock2", warehouseId: "w1" },
  ],
  operations: [
    { id: "o1", type: "IN", ref: "WH/IN/0001", contact: "Azure Interior", from: "Vendor", to: "WH/Stock1", scheduleDate: day(-2), responsible: "admin", status: "ready", lines: [{ productId: "p1", qty: 6 }] },
    { id: "o2", type: "IN", ref: "WH/IN/0002", contact: "Azure Interior", from: "Vendor", to: "WH/Stock1", scheduleDate: day(3), responsible: "admin", status: "draft", lines: [{ productId: "p4", qty: 20 }] },
    { id: "o3", type: "OUT", ref: "WH/OUT/0001", contact: "Azure Interior", from: "WH/Stock1", to: "Customer", scheduleDate: day(-1), responsible: "admin", status: "ready", lines: [{ productId: "p1", qty: 5 }] },
    { id: "o4", type: "OUT", ref: "WH/OUT/0002", contact: "Deco Addict", from: "WH/Stock1", to: "Customer", scheduleDate: day(2), responsible: "admin", status: "waiting", lines: [{ productId: "p4", qty: 4 }] },
  ],
  moves: [
    { id: "m1", ref: "WH/IN/0000", date: day(-10), contact: "Azure Interior", from: "Vendor", to: "WH/Stock1", productId: "p1", qty: 50, direction: "in" },
    { id: "m2", ref: "WH/IN/0000", date: day(-10), contact: "Azure Interior", from: "Vendor", to: "WH/Stock1", productId: "p2", qty: 50, direction: "in" },
  ],
  users: [{ loginId: "admin1", email: "admin@stocksense.app", password: "Admin@123" }],
  session: null,
};

let state: State = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}
function set(updater: (s: State) => State) {
  state = updater(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  load();
  listeners.add(l);
  queueMicrotask(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return select(state);
    },
    () => select(seed),
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);
export const today = () => new Date().toISOString().slice(0, 10);

/* ---------- selectors ---------- */
export function reservedQty(s: State, productId: string, excludeId?: string) {
  return s.operations
    .filter((o) => o.type === "OUT" && o.status === "ready" && o.id !== excludeId)
    .reduce((sum, o) => sum + o.lines.filter((l) => l.productId === productId).reduce((a, l) => a + l.qty, 0), 0);
}
export function freeQty(s: State, productId: string, excludeId?: string) {
  const p = s.products.find((x) => x.id === productId);
  return (p?.onHand ?? 0) - reservedQty(s, productId, excludeId);
}
export function isLate(o: Operation) {
  return o.scheduleDate < today() && o.status !== "done" && o.status !== "cancelled";
}

/* ---------- actions ---------- */
export const actions = {
  login(loginId: string, password: string) {
    const u = state.users.find((x) => x.loginId === loginId && x.password === password);
    if (!u) return false;
    set((s) => ({ ...s, session: u.loginId }));
    return true;
  },
  signup(u: User): string | null {
    if (state.users.some((x) => x.loginId === u.loginId)) return "Login ID already exists";
    if (state.users.some((x) => x.email === u.email)) return "Email already registered";
    set((s) => ({ ...s, users: [...s.users, u], session: u.loginId }));
    return null;
  },
  logout() {
    set((s) => ({ ...s, session: null }));
  },
  createOperation(type: OpType): string {
    const id = uid();
    const wh = state.warehouses[0]?.code ?? "WH";
    const n = state.operations.filter((o) => o.type === type).length + 1;
    const loc = state.locations[0] ? `${wh}/${state.locations[0].code}` : wh;
    const op: Operation = {
      id,
      type,
      ref: `${wh}/${type}/${String(n).padStart(4, "0")}`,
      contact: "",
      from: type === "IN" ? "Vendor" : loc,
      to: type === "IN" ? loc : "Customer",
      scheduleDate: today(),
      responsible: state.session ?? "",
      status: "draft",
      lines: [],
    };
    set((s) => ({ ...s, operations: [op, ...s.operations] }));
    return id;
  },
  updateOperation(id: string, patch: Partial<Operation>) {
    set((s) => ({ ...s, operations: s.operations.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  },
  /** Draft → Ready (receipts) or Draft/Waiting → Waiting|Ready (deliveries, based on availability) */
  markTodo(id: string) {
    const op = state.operations.find((o) => o.id === id);
    if (!op) return;
    if (op.type === "IN") return actions.updateOperation(id, { status: "ready" });
    const short = op.lines.some((l) => l.qty > freeQty(state, l.productId, id));
    actions.updateOperation(id, { status: short ? "waiting" : "ready" });
  },
  validate(id: string) {
    const op = state.operations.find((o) => o.id === id);
    if (!op || op.status !== "ready") return;
    const date = today();
    set((s) => ({
      ...s,
      products: s.products.map((p) => {
        const q = op.lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0);
        return q ? { ...p, onHand: p.onHand + (op.type === "IN" ? q : -q) } : p;
      }),
      operations: s.operations.map((o) => (o.id === id ? { ...o, status: "done" } : o)),
      moves: [
        ...op.lines.map((l) => ({
          id: uid(),
          ref: op.ref,
          date,
          contact: op.contact,
          from: op.from,
          to: op.to,
          productId: l.productId,
          qty: l.qty,
          direction: (op.type === "IN" ? "in" : "out") as "in" | "out",
        })),
        ...s.moves,
      ],
    }));
  },
  cancel(id: string) {
    actions.updateOperation(id, { status: "cancelled" });
  },
  adjustStock(productId: string, newQty: number) {
    const p = state.products.find((x) => x.id === productId);
    if (!p || newQty === p.onHand) return;
    const diff = newQty - p.onHand;
    const wh = state.warehouses[0]?.code ?? "WH";
    set((s) => ({
      ...s,
      products: s.products.map((x) => (x.id === productId ? { ...x, onHand: newQty } : x)),
      moves: [
        {
          id: uid(),
          ref: `${wh}/ADJ/${String(s.moves.filter((m) => m.ref.includes("/ADJ/")).length + 1).padStart(4, "0")}`,
          date: today(),
          contact: "Inventory adjustment",
          from: diff > 0 ? "Adjustment" : `${wh}/Stock`,
          to: diff > 0 ? `${wh}/Stock` : "Adjustment",
          productId,
          qty: Math.abs(diff),
          direction: diff > 0 ? "in" : "out",
        },
        ...s.moves,
      ],
    }));
  },
  saveProduct(p: Omit<Product, "id"> & { id?: string }) {
    set((s) =>
      p.id
        ? { ...s, products: s.products.map((x) => (x.id === p.id ? { ...x, ...p, id: x.id } : x)) }
        : { ...s, products: [...s.products, { ...p, id: uid() }] },
    );
  },
  saveWarehouse(w: Omit<Warehouse, "id"> & { id?: string }) {
    set((s) =>
      w.id
        ? { ...s, warehouses: s.warehouses.map((x) => (x.id === w.id ? { ...x, ...w, id: x.id } : x)) }
        : { ...s, warehouses: [...s.warehouses, { ...w, id: uid() }] },
    );
  },
  saveLocation(l: Omit<Location, "id"> & { id?: string }) {
    set((s) =>
      l.id
        ? { ...s, locations: s.locations.map((x) => (x.id === l.id ? { ...x, ...l, id: x.id } : x)) }
        : { ...s, locations: [...s.locations, { ...l, id: uid() }] },
    );
  },
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
