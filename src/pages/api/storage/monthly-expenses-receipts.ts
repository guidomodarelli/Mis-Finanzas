import {
  deleteMonthlyExpenseReceipt,
} from "@/modules/monthly-expenses/application/use-cases/delete-monthly-expense-receipt";
import {
  uploadMonthlyExpenseReceipt,
} from "@/modules/monthly-expenses/application/use-cases/upload-monthly-expense-receipt";
import {
  createMonthlyExpenseReceiptsApiHandler,
} from "@/modules/monthly-expenses/infrastructure/api/create-monthly-expense-receipts-api-handler";
import {
  GoogleDriveMonthlyExpenseReceiptsRepository,
} from "@/modules/monthly-expenses/infrastructure/google-drive/repositories/google-drive-monthly-expense-receipts-repository";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default createMonthlyExpenseReceiptsApiHandler({
  async remove({ command, driveClient }) {
    await deleteMonthlyExpenseReceipt({
      command,
      repository: new GoogleDriveMonthlyExpenseReceiptsRepository(driveClient),
    });
  },
  async upload({ command, driveClient }) {
    return uploadMonthlyExpenseReceipt({
      command,
      repository: new GoogleDriveMonthlyExpenseReceiptsRepository(driveClient),
    });
  },
});
