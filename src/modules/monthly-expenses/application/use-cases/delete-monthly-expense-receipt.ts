import type { DeleteMonthlyExpenseReceiptCommand } from "../commands/delete-monthly-expense-receipt-command";
import type { MonthlyExpenseReceiptsRepository } from "../../domain/repositories/monthly-expense-receipts-repository";

interface DeleteMonthlyExpenseReceiptDependencies {
  command: DeleteMonthlyExpenseReceiptCommand;
  repository: MonthlyExpenseReceiptsRepository;
}

export async function deleteMonthlyExpenseReceipt({
  command,
  repository,
}: DeleteMonthlyExpenseReceiptDependencies): Promise<void> {
  const fileId = command.fileId.trim();

  if (!fileId) {
    throw new Error("Monthly expense receipt deletion requires a file id.");
  }

  await repository.deleteReceipt({
    fileId,
  });
}
