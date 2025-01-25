import { Scheduler } from "../scheduler";
import { sleep } from "./utils";

describe("Scheduler", () => {
  it("should assure the task is executed in order when it returns a Promise", async () => {
    const scheduler = new Scheduler({
      isTrackerInitialized: () => true,
      batch: {
        enable: false,
      },
    });

    const task1 = vi.fn().mockImplementationOnce(async () => {
      await sleep(1000);
      return { a: 1 };
    });
    const task2 = vi.fn().mockImplementationOnce(async () => {
      await sleep(300);
      return { a: 2 };
    });
    const task3 = vi.fn().mockImplementationOnce(() => {
      return { a: 3 };
    });

    scheduler.schedule(task1);
    scheduler.schedule(task2);
    scheduler.schedule(task3);

    // task1 not resolved yet
    expect(task1).not.toHaveResolved();

    await sleep(1); // wait for execution context to be finished

    await sleep(1000); // wait for task1 to be resolved
    expect(task1).toHaveResolvedWith({ a: 1 });
    expect(task2).not.toHaveResolved();

    await sleep(300); // wait for task2 to be resolved
    expect(task2).toHaveResolvedWith({ a: 2 });

    expect(task3).toHaveReturned();
  });
});
