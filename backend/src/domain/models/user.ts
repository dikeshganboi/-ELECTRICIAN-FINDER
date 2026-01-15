export type Role = "user" | "electrician" | "admin";

export interface UserProps {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  ratingsAverage?: number;
  ratingsCount?: number;
}
