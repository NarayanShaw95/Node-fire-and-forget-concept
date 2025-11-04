import dotenv from "dotenv";
import amqp from "amqplib";

dotenv.config();

const setupQueues = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    const channel = await connection.createChannel();

    // Dead Letter Queue
    await channel.assertQueue(process.env.DLQ, { durable: true });

    // Main queue with DLQ configuration
    await channel.assertQueue(process.env.MAIN_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": process.env.DLQ,
      },
    });

    console.log("✅ Queues setup done!");

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

setupQueues();
