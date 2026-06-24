export function formatMoney(value: number): string {
  return "Rs " + value.toLocaleString("en-IN");
}

export function formatPct(value: number): string {
  return value + "%";
}

export function countdown(deadline: string, now: string): string {
  const diff = new Date(deadline).getTime() - new Date(now).getTime();
  if (diff <= 0) return "Overdue";
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return hrs > 0 ? hrs + "h " + rem + "m left" : rem + "m left";
}
