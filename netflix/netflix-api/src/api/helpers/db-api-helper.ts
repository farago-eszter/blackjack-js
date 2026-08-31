import axios from "axios";

export const dbApiClient = axios.create({
  baseURL: process.env.DB_API_URL,
});

export function mapObjectFromDb(mongoObject: any) {
  const id = mongoObject._id;
  delete mongoObject._id;
  delete mongoObject.__v;
  return { ...mongoObject, id };
}
