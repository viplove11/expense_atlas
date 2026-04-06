import bcrypt from 'bcryptjs';

export class User {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.createdAt = new Date();
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}