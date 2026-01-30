// src/api/callApi.ts
import { http } from "./http";

export const fetchTwilioToken = async (callerId: string) => {
  const { data } = await http.get("/call/token", {
    params: {
      provider: "TWILIO",
      callerId,
    },
  });
  console.log("thisis data token " , data.data)
  return data.data;
};

export const createCall = async (recipientId: string) => {
  const { data } = await http.post("/call", { recipientId });
  return data;
};

export const acceptCallApi = (callId: string) =>
  http.put("/call/accept", { callId });

export const rejectCallApi = (callId: string) =>
  http.put("/call/reject", { callId });

export const endCallApi = (callId: string) =>
  http.put("/call/end", { callId });
