import express from "express";
import { sendEmail } from "./sendEmail.js";
import { usingChildProcess } from "./child-processes/childProcess.js";
import { connectQueue, sendToQueue } from "./job-queues/producer.js";

const app = express();
app.use(express.json());

app.post("/register", async (req, res) => {
  const user = req.body;

  /**
   * =======================================================
   * Level 1 - Simple Fire and Forget with Async Functions
   * =======================================================
   * Usage:
   *  - Call an async function (like sendEmail) directly and "fire-and-forget" by catching errors.
   * When to use:
   *  - Only for very lightweight, fast tasks
   *  - When you don't need retries or persistence
   * Issues / Limitations:
   *  - If your Node.js process crashes before the task completes, the email/job is lost
   *  - Not scalable for multiple workers or high traffic
   * Example:
   */
  //   await sendEmail(user).catch((err) => {
  //     console.error("Error sending email", err);
  //   });
  //   res.send("User registered successfully");

  /**
   * =======================================================
   * Level 2 - Fire and Forget Using Child Processes (Background Workers)
   * =======================================================
   * Usage:
   *  - Spawn a child process to handle the job separately from the main app process
   * When to use:
   *  - When the task is CPU-intensive or blocks the event loop
   *  - When you want to isolate long-running tasks from the main server
   * Issues / Limitations:
   *  - Child process management adds complexity
   *  - Limited scalability (one process per task)
   *  - Harder to persist jobs or retry on failure
   * Example:
   */
  //   await usingChildProcess(user).catch((err) =>
  //     console.error("Error sending email", err)
  //   );
  //   res.send("User registered successfully");

  /**
   * =======================================================
   * Level 3 - Fire and Forget with a Job Queue (Recommended for Production)
   * =======================================================
   * Usage:
   *  - Send the task to a persistent job queue (like RabbitMQ, Bull, etc.)
   *  - Workers consume tasks asynchronously, possibly on other machines
   * When to use:
   *  - For any production scenario where reliability, retries, and scaling matter
   *  - Background tasks that may fail or take time to process
   *  - Multi-worker, distributed processing
   * Benefits:
   *  - Tasks are persisted until processed
   *  - Easy to scale horizontally by adding more workers
   *  - Supports retries, failure handling, and monitoring
   * Example:
   */
  try {
    sendToQueue(user);
    res.send("✅ User registered! Email will be sent soon.");
  } catch (error) {
    console.error("Error sending message:", err);
    res.status(500).send("❌ Failed to queue email.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectQueue();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
