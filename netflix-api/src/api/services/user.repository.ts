import { randomUUID } from "crypto";

interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
class UserRepository {
  users: Map<string, User> = new Map();
  

  insert(user: User): User {
    const existingUser = [...this.users.values()].find((u) => u.username === user.username || u.email === user.email);

    if (existingUser) {
      throw new Error("User with this username or email already exists.");
    }
    const id = this.generateId()
    const newUser = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }
  generateId(): string {
    return randomUUID();
  }

  findUserByUsernameAndPassword(username: string, password: string): User | undefined {
    return [...this.users.values()].find((user) => user.username === username && user.password === password);
  }
  clear(): void {
    this.users.clear();
  }
}

export const userRepository = new UserRepository();
