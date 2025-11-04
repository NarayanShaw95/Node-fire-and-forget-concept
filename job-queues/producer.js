import dotenv from "dotenv";
import amqp from "amqplib";

dotenv.config();
let channel;

export const connectQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    channel = await connection.createChannel();

    // Handle unexcepted channel clouser
    channel.on("error", (err) => console.error("Channel error:", err));
    channel.on("close", () => console.warn("Channel closed"));

    console.log("✅ Connected to RabbitMQ with DLQ setup");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

export const sendToQueue = (data) => {
  try {
    if (!channel) throw new Error("RabbitMQ channel not initialized");

    // Initialize retry counts
    const job = { ...data, retries: 0 };
    const buffer = Buffer.from(JSON.stringify(job));

    channel.sendToQueue(process.env.MAIN_QUEUE, buffer, {
      persistent: true,
    });

    console.log("📨 Message sent to main queue:", job);
  } catch (error) {
    console.error("❌ Failed to send message to queue:", error);
  }
};
