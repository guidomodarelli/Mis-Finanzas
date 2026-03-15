export interface UploadMonthlyExpenseReceiptCommand {
  contentBase64: string;
  expenseDescription: string;
  fileName: string;
  month: string;
  mimeType: string;
}
