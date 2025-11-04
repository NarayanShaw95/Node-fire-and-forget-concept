import { fork } from "child_process";

export const usingChildProcess = async (user) => {
  const worker = fork("./child-processes/backgroundTask.js");
  worker.send({ userId: user.id });
  console.log(`Process started for userId: ${user.id}`);
};
