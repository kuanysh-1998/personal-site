export interface LocalStorageSetOptions {
  userId?: string | number;
  lifetimeMinutes?: number;
}

interface StoredMetadata {
  lastModified: string;
  expiresAt?: string;
}

export interface StoredNode {
  value: unknown;
  __metadata__: StoredMetadata;
}

export type RootData = Record<string, StoredNode>;
