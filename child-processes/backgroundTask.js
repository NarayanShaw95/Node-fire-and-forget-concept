process.on("message", async (message) => {
  console.log(`Processing for userId: ${message.userId}`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("Finished processing");
  process.exit();
});
