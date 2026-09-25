// Order lifecycle. Status is a fixed set of values (a Postgres enum), never free text.

export const ORDER_STATUSES = [
  "new",
  "processing",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** The forward path; `cancelled` can be reached from any non-terminal state. */
const FORWARD: OrderStatus[] = ["new", "processing", "out_for_delivery", "completed"];

export const isTerminal = (status: OrderStatus) =>
  status === "completed" || status === "cancelled";

/** Statuses an order may move to from `from`: any later step, or cancelled. */
export function allowedNextStatuses(from: OrderStatus): OrderStatus[] {
  if (isTerminal(from)) return [];
  const later = FORWARD.slice(FORWARD.indexOf(from) + 1);
  return [...later, "cancelled"];
}

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  allowedNextStatuses(from).includes(to);

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
