import { dbApiClient, mapObjectFromDb } from "../helpers/db-api-helper";
import { hashPassword } from "../helpers/utils";

interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}
class UserRepository {
  async insert(user: User): Promise<User> {
    user.password = hashPassword(user.password!);
    const createdUser = (await dbApiClient.post("/User", user)).data;
    const newUser = mapObjectFromDb(createdUser);
    return newUser;
  }

  async findUserByUsernameAndPassword(username: string, password: string): Promise<User | undefined> {
    const existingUsers = (
      await dbApiClient.get("/User", {
        params: { query: { username: username, password: password } },
      })
    ).data;
    return existingUsers.length ? mapObjectFromDb(existingUsers[0]) : undefined;
  }

  async deleteAll(): Promise<void> {
    await dbApiClient.delete("/User");
  }
}

export const userRepository = new UserRepository();
