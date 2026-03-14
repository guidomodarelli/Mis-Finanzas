export interface MonthlyExpensesCopyableMonthsResult {
  defaultSourceMonth: string | null;
  sourceMonths: string[];
  targetMonth: string;
}

export function createEmptyMonthlyExpensesCopyableMonthsResult(
  targetMonth: string,
): MonthlyExpensesCopyableMonthsResult {
  return {
    defaultSourceMonth: null,
    sourceMonths: [],
    targetMonth,
  };
}
