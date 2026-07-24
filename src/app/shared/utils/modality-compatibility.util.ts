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

// Given an availability slot's configured modality, returns the concrete
// modality options a patient can pick when booking it. Unlike
// getAllowedModalities (which checks whether a *service* stays eligible under
// a chosen block modality, where ANY is a valid match either way), a
// LOCAL/REMOTE-only slot only ever produces a session of that one modality -
// "Qualquer" isn't itself a bookable outcome, so it must not appear here.
export function getBookableModalities(slotModality: string): Modality[] {
  const normalized = normalizeModality(slotModality);
  if (normalized === Modality.LOCAL) return [Modality.LOCAL];
  if (normalized === Modality.REMOTE) return [Modality.REMOTE];
  return [Modality.ANY, Modality.LOCAL, Modality.REMOTE];
}

// Backend expects the raw SessionModality enum name, not the Portuguese label.
export function toBackendModality(m: Modality): string {
  if (m === Modality.LOCAL) return 'LOCAL';
  if (m === Modality.REMOTE) return 'REMOTE';
  return 'ANY';
}
