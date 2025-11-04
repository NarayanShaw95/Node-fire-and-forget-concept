export const sendEmail = async (user) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`Email sent to ${user.name}`);
};
