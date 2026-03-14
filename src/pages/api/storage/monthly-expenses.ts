import { getMonthlyExpensesDocument } from "@/modules/monthly-expenses/application/use-cases/get-monthly-expenses-document";
import { saveMonthlyExpensesDocument } from "@/modules/monthly-expenses/application/use-cases/save-monthly-expenses-document";
import { createMonthlyExpensesApiHandler } from "@/modules/monthly-expenses/infrastructure/api/create-monthly-expenses-api-handler";
import { DrizzleMonthlyExpensesRepository } from "@/modules/monthly-expenses/infrastructure/turso/repositories/drizzle-monthly-expenses-repository";

export default createMonthlyExpensesApiHandler({
  async load({ database, month, userSubject }) {
    return getMonthlyExpensesDocument({
      query: {
        month,
      },
      repository: new DrizzleMonthlyExpensesRepository(database, userSubject),
    });
  },
  async save({ command, database, userSubject }) {
    return saveMonthlyExpensesDocument({
      command,
      repository: new DrizzleMonthlyExpensesRepository(database, userSubject),
    });
  },
});
