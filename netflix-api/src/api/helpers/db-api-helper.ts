import axios from "axios";

export const dbApiClient = axios.create({
  baseURL: "http://netflix-db-api:4000/api/v1",
});

export function mapObjectFromDb(mongoObject: any) {
  const id = mongoObject._id;
  delete mongoObject._id;
  delete mongoObject.__v;
  return { ...mongoObject, id };
}
