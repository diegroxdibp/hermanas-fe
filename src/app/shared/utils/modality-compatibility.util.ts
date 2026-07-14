import { Modality } from '../enums/modality.enum';

// Backend serializes SessionModality as the raw Java enum name ('LOCAL'/'REMOTE'/'ANY'),
// not the Portuguese Modality label ('Presencial'/'Remoto'/'Qualquer') - normalize before comparing.
export function normalizeModality(m: string): Modality {
  if (m === 'LOCAL' || m === Modality.LOCAL) return Modality.LOCAL;
  if (m === 'REMOTE' || m === Modality.REMOTE) return Modality.REMOTE;
  return Modality.ANY;
}

export function getAllowedModalities(serviceModality: string): Modality[] {
  const normalized = normalizeModality(serviceModality);
  if (normalized === Modality.LOCAL) return [Modality.ANY, Modality.LOCAL];
  if (normalized === Modality.REMOTE) return [Modality.ANY, Modality.REMOTE];
  return [Modality.ANY, Modality.LOCAL, Modality.REMOTE];
}

export function isModalityCompatible(serviceModality: string, candidate: Modality): boolean {
  return getAllowedModalities(serviceModality).includes(candidate);
}

// Backend expects the raw SessionModality enum name, not the Portuguese label.
export function toBackendModality(m: Modality): string {
  if (m === Modality.LOCAL) return 'LOCAL';
  if (m === Modality.REMOTE) return 'REMOTE';
  return 'ANY';
}
