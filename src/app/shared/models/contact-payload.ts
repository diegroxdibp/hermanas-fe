export interface ContactPayload {
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
}
