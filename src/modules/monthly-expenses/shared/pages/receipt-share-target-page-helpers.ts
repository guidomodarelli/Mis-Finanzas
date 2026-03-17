import {
  compareFuzzyMatchRank,
  getFuzzyMatchRank,
  normalizeSearchValue,
} from "@/components/monthly-expenses/fuzzy-search";

const RECEIPT_NOISE_WORDS = new Set([
  "comprobante",
  "factura",
  "pago",
  "receipt",
  "recibo",
  "ticket",
]);

export interface ReceiptSuggestionExpense {
  description: string;
  id: string;
}

export function getCurrentMonthIdentifier(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function deriveExpenseSearchQueryFromFileName(fileName: string): string {
  const normalizedFileName = fileName.trim();
  const fileNameWithoutExtension = normalizedFileName.replace(/\.[^/.]+$/, "");
  const fileNameWithoutDatePrefix = fileNameWithoutExtension.replace(
    /^\d{4}[-_]?\d{2}[-_]?\d{2}[\s_-]*/,
    "",
  );

  const normalizedQuery = fileNameWithoutDatePrefix
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizedQuery
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 0)
    .filter((word) => !RECEIPT_NOISE_WORDS.has(normalizeSearchValue(word)))
    .join(" ");
}

export function suggestExpenseIdForSharedReceipt({
  expenses,
  fileName,
}: {
  expenses: ReceiptSuggestionExpense[];
  fileName: string;
}): string | null {
  const query = deriveExpenseSearchQueryFromFileName(fileName);

  if (!query) {
    return null;
  }

  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return null;
  }

  let bestMatch: {
    expenseId: string;
    rank: NonNullable<ReturnType<typeof getFuzzyMatchRank>>;
  } | null = null;

  for (const expense of expenses) {
    const rank = getFuzzyMatchRank(expense.description, normalizedQuery);

    if (!rank) {
      continue;
    }

    if (!bestMatch || compareFuzzyMatchRank(rank, bestMatch.rank) < 0) {
      bestMatch = {
        expenseId: expense.id,
        rank,
      };
    }
  }

  return bestMatch?.expenseId ?? null;
}

export function getRemainingReceiptPayments({
  coveredPaymentsByReceipts,
  manualCoveredPayments,
  occurrencesPerMonth,
}: {
  coveredPaymentsByReceipts: number;
  manualCoveredPayments: number;
  occurrencesPerMonth: number;
}): number {
  const remaining =
    Math.trunc(occurrencesPerMonth) -
    Math.trunc(manualCoveredPayments) -
    Math.trunc(coveredPaymentsByReceipts);

  return Math.max(remaining, 0);
}
