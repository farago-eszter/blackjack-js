interface User {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
class UserRepository {
  users: Map<number, User> = new Map();
  counter: number = 1;

  insert(user: User): User {
    const existingUser = [...this.users.values()].find((u) => u.username === user.username || u.email === user.email);

    if (existingUser) {
      throw new Error("User with this username or email already exists.");
    }
    const id = this.counter++;
    const newUser = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }

  findUserByUsernameAndPassword(username: string, password: string): User | undefined {
    return [...this.users.values()].find((user) => user.username === username && user.password === password);
  }
  clear(): void {
    this.users.clear();
    this.counter = 1;
  }
}

export const userRepository = new UserRepository();
