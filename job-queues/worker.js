import dotenv from "dotenv";
import amqp from "amqplib";

dotenv.config();

const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");

const startWorker = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    const channel = await connection.createChannel();

    console.log("👷 Worker connected. Waiting for messages...");

    channel.consume(process.env.MAIN_QUEUE, async (message) => {
      if (!message) return;

      const job = JSON.parse(message.content.toString());
      job.retries = job.retries || 0;

      console.log(`📩 Processing: ${job.email}, attempt: ${job.retries + 1}`);

      try {
        // Simulate task processing
        if (Math.random() < 0.7) throw new Error("Simulated Task failed");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`✅ Job completed for: ${job.email}`);
        channel.ack(message);
      } catch (error) {
        console.log(`⚠️ Task failed for ${job.email}: ${error.message}`);

        job.retries += 1;
        if (job.retries < MAX_RETRIES) {
          console.log(`🔄 Retrying ${job.email}, attempt ${job.retries}`);

          //  Requeue the job with incremented retry count
          channel.sendToQueue(
            process.env.MAIN_QUEUE,
            Buffer.from(JSON.stringify(job)),
            {
              persistent: true,
            }
          );
        } else {
          console.log(`💀 Max retries reached for ${job.email}, moving to DLQ`);

          channel.sendToQueue(
            process.env.DLQ,
            Buffer.from(JSON.stringify(job)),
            {
              persistent: true,
            }
          );
        }

        channel.ack(message);
      }
    });
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

startWorker();
