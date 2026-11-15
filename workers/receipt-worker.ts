import { loadLocalEnv } from "@/workers/load-env";
import {
  DEFAULT_ATTEMPT_TIMEOUT_MS,
  DEFAULT_HEARTBEAT_MS,
  DEFAULT_LEASE_MS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_WORKER_CONCURRENCY,
} from "@/workers/extraction-policy";

loadLocalEnv();

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      event: "worker.failed",
      code: error instanceof Error ? error.name : "UNKNOWN",
      message: error instanceof Error ? error.message : "Worker failed",
    }),
  );
  process.exit(1);
});

async function main() {
  const mode = readMode(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const config = readConfig();
  const { createWorkerDb, runDaemon, runOnce } = await import("@/workers/receipt-processor");
  const db = createWorkerDb(databaseUrl, config.concurrency + 1);
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  const logger = (event: Record<string, string | number | boolean | null>) => {
    console.log(JSON.stringify(event));
  };

  try {
    logger({
      event: "worker.start",
      mode,
      concurrency: config.concurrency,
      pollIntervalMs: config.pollIntervalMs,
    });

    const options = {
      db,
      workerId: config.workerId,
      concurrency: config.concurrency,
      leaseMs: config.leaseMs,
      heartbeatMs: config.heartbeatMs,
      attemptTimeoutMs: config.attemptTimeoutMs,
      signal: controller.signal,
      logger,
    };

    if (mode === "once") {
      await runOnce(options);
    } else {
      await runDaemon({ ...options, pollIntervalMs: config.pollIntervalMs });
    }

    logger({ event: "worker.exit", mode });
  } finally {
    await db.end();
  }
}

function readMode(args: string[]): "once" | "daemon" {
  const once = args.includes("--once");
  const daemon = args.includes("--daemon");
  if (once === daemon) {
    throw new Error("Usage: pnpm worker --once | pnpm worker --daemon");
  }
  return once ? "once" : "daemon";
}

function readConfig() {
  return {
    workerId: `receipt-worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`,
    concurrency: readPositiveInt("RECEIPT_WORKER_CONCURRENCY", DEFAULT_WORKER_CONCURRENCY),
    pollIntervalMs: readPositiveInt("RECEIPT_WORKER_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS),
    leaseMs: readPositiveInt("RECEIPT_WORKER_LEASE_MS", DEFAULT_LEASE_MS),
    heartbeatMs: readPositiveInt("RECEIPT_WORKER_HEARTBEAT_MS", DEFAULT_HEARTBEAT_MS),
    attemptTimeoutMs: readPositiveInt(
      "RECEIPT_WORKER_ATTEMPT_TIMEOUT_MS",
      DEFAULT_ATTEMPT_TIMEOUT_MS,
    ),
  };
}

function readPositiveInt(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}
