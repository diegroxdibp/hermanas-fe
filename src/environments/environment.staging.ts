export const environment = {
  production: false,
  apiUrl: 'https://api-staging.careclinica.com',

  /**
   * Sem integração de pagamento nesta fase. O seletor de método existe e é
   * testado — apenas não é renderizado enquanto isto for falso.
   */
  paymentsEnabled: false,
};
