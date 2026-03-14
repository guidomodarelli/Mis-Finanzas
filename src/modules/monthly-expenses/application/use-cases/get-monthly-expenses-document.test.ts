import type { MonthlyExpensesRepository } from "../../domain/repositories/monthly-expenses-repository";
import { getMonthlyExpensesDocument } from "./get-monthly-expenses-document";

describe("getMonthlyExpensesDocument", () => {
  it("returns an empty monthly document when Drive has no file for the requested month", async () => {
    const repository: MonthlyExpensesRepository = {
      getByMonth: jest.fn().mockResolvedValue(null),
      listAll: jest.fn(),
      save: jest.fn(),
    };

    const result = await getMonthlyExpensesDocument({
      query: {
        month: "2026-03",
      },
      repository,
    });

    expect(result).toEqual({
      items: [],
      month: "2026-03",
    });
  });

  it("keeps a stored empty month as empty without copying data from another month", async () => {
    const repository: MonthlyExpensesRepository = {
      getByMonth: jest
        .fn()
        .mockResolvedValueOnce({
          items: [],
          month: "2026-03",
        })
        .mockResolvedValueOnce({
          items: [
            {
              currency: "ARS",
              description: "Internet",
              id: "expense-1",
              occurrencesPerMonth: 1,
              subtotal: 15000,
              total: 15000,
            },
          ],
          month: "2026-02",
        }),
      listAll: jest.fn(),
      save: jest.fn(),
    };

    const result = await getMonthlyExpensesDocument({
      query: {
        month: "2026-03",
      },
      repository,
    });

    expect(result).toEqual({
      items: [],
      month: "2026-03",
    });
    expect(repository.getByMonth).toHaveBeenCalledTimes(1);
    expect(repository.getByMonth).toHaveBeenCalledWith("2026-03");
  });
});
