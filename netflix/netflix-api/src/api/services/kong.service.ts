import axios from "axios";

export const kongClient = axios.create({
  baseURL: process.env.KONG_ADMIN_API_URL,
  headers: {
    apikey: process.env.KONG_ADMIN_API_KEY,
  },
});

export async function createConsumer(username: string): Promise<void> {
  await kongClient.post("/consumers", { username, tags: ["user"] });
  await kongClient.post(`/consumers/${username}/acls`, { group: "users" });
}

export async function addApiKeyToConsumer(username: string): Promise<string> {
  const sessionId = (await kongClient.post(`/consumers/${username}/key-auth`)).data.key;
  return sessionId;
}

export async function deleteApiKeyFromConsumer(username: string, sessionId: string): Promise<void> {
  await kongClient.delete(`/consumers/${username}/key-auth/${sessionId}`);
}
