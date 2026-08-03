/**
 * Estado de uma marcação.
 *
 * `PAYMENT_PENDING` já existe no modelo embora ainda seja inalcançável: quando
 * o pagamento entrar, o estado passa a ser devolvido pelo backend e a UI não
 * precisa de mudar de forma.
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
}
