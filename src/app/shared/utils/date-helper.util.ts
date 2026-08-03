export const sameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const isBetween = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

export const dayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12); // noon = timezone safe
};

/**
 * Formata uma hora de parede ('14:00:00') em 24h.
 *
 * O locale é fixado de propósito: com o locale do navegador, quem estivesse
 * num browser en-US via '02:00 PM' e quem estivesse em pt-BR via '14:00' — a
 * mesma sessão com dois aspetos diferentes. A CARE mostra sempre 24h.
 *
 * Não converte fuso: serve para a tela da pessoa profissional, que autoria no
 * relógio dela. Para horas voltadas ao paciente use o UserTimePipe.
 */
export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
