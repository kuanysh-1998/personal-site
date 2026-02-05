import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import type { LocalStorageSetOptions, RootData, StoredNode } from './local-storage.types';

const DEFAULT_ROOT_KEY = 'global';

@Injectable()
export class LocalStorageService {
  private readonly _document = inject(DOCUMENT);
  private readonly _storage: Storage | null = this._document.defaultView?.localStorage ?? null;

  private _getRootKey(userId?: string | number): string {
    return userId !== undefined && userId !== '' ? `user_${userId}` : DEFAULT_ROOT_KEY;
  }

  public set(keyPath: string, value: unknown, options?: LocalStorageSetOptions): void {
    if (!this._storage) {
      return;
    }

    const rootKey = this._getRootKey(options?.userId);
    const storedData = this._storage.getItem(rootKey);
    const rootData: RootData = storedData ? (JSON.parse(storedData) as RootData) : {};

    const keys = this._parseKeyPath(keyPath);
    if (keys.length === 0) {
      throw new Error('Invalid key path');
    }

    const rootObjectKey = keys.shift() ?? '';

    if (keys.length === 0) {
      const metadata: StoredNode['__metadata__'] = {
        lastModified: new Date().toISOString(),
        ...(options?.lifetimeMinutes !== undefined
          ? {
              expiresAt: new Date(Date.now() + options.lifetimeMinutes * 60_000).toISOString(),
            }
          : {}),
      };
      rootData[rootObjectKey] = {
        value,
        __metadata__: metadata,
      };
      this._storage.setItem(rootKey, JSON.stringify(rootData));
      return;
    }

    if (!rootData[rootObjectKey]) {
      const isArray = !Number.isNaN(Number(keys[0]));
      rootData[rootObjectKey] = {
        value: isArray ? [] : {},
        __metadata__: { lastModified: new Date().toISOString() },
      };
    }

    let current: unknown = rootData[rootObjectKey].value;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      const isNextArrayIndex = !Number.isNaN(Number(nextKey));

      if (Array.isArray(current)) {
        const index = Number(key);
        if (Number.isNaN(index)) {
          throw new Error('Invalid array index');
        }
        if (current[index] === undefined) {
          current[index] = isNextArrayIndex ? [] : {};
        }
        current = current[index];
      } else if (current !== null && typeof current === 'object') {
        const obj = current as Record<string, unknown>;
        if (obj[key] === undefined) {
          obj[key] = isNextArrayIndex ? [] : {};
        }
        current = obj[key];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current)) {
      const index = Number(lastKey);
      if (Number.isNaN(index)) {
        throw new Error('Invalid array index');
      }
      current[index] = value;
    } else if (current !== null && typeof current === 'object') {
      (current as Record<string, unknown>)[lastKey] = value;
    }

    const node = rootData[rootObjectKey];
    node.__metadata__.lastModified = new Date().toISOString();
    if (options?.lifetimeMinutes !== undefined) {
      node.__metadata__.expiresAt = new Date(
        Date.now() + options.lifetimeMinutes * 60_000,
      ).toISOString();
    }

    this._storage.setItem(rootKey, JSON.stringify(rootData));
  }

  public get<T = unknown>(keyPath: string, userId?: string | number): T | undefined {
    if (!this._storage) {
      return undefined;
    }

    const rootKey = this._getRootKey(userId);
    const storedData = this._storage.getItem(rootKey);
    if (!storedData) {
      return undefined;
    }

    const rootData = JSON.parse(storedData, this._reviveDate) as RootData;
    const keys = this._parseKeyPath(keyPath);
    if (keys.length === 0) {
      return undefined;
    }

    const rootObjectKey = keys.shift() ?? '';
    const rootObject = rootData[rootObjectKey];

    if (!rootObject) {
      return undefined;
    }

    const metadata = rootObject.__metadata__;
    if (metadata?.expiresAt && new Date(metadata.expiresAt) <= new Date()) {
      delete rootData[rootObjectKey];
      this._storage.setItem(rootKey, JSON.stringify(rootData));
      return undefined;
    }

    let current: unknown = rootObject.value;

    for (const key of keys) {
      if (Array.isArray(current)) {
        const index = Number(key);
        if (Number.isNaN(index) || index < 0 || index >= current.length) {
          return undefined;
        }
        current = current[index];
      } else if (current !== null && typeof current === 'object') {
        const obj = current as Record<string, unknown>;
        if (!(key in obj)) {
          return undefined;
        }
        current = obj[key];
      } else {
        return undefined;
      }
    }

    return current as T;
  }

  public remove(keyPath: string, userId?: string | number): void {
    if (!this._storage) {
      return;
    }

    const rootKey = this._getRootKey(userId);
    const storedData = this._storage.getItem(rootKey);
    if (!storedData) {
      return;
    }

    const rootData = JSON.parse(storedData) as RootData;
    const keys = this._parseKeyPath(keyPath);
    if (keys.length === 0) {
      this._storage.removeItem(rootKey);
      return;
    }

    const rootObjectKey = keys.shift() ?? '';
    if (!(rootObjectKey in rootData)) {
      return;
    }

    if (keys.length === 0) {
      delete rootData[rootObjectKey];
    } else {
      let current: unknown = rootData[rootObjectKey]?.value;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (Array.isArray(current)) {
          const index = Number(key);
          if (Number.isNaN(index) || index < 0 || index >= current.length) {
            return;
          }
          current = current[index];
        } else if (current !== null && typeof current === 'object') {
          const obj = current as Record<string, unknown>;
          if (!(key in obj)) {
            return;
          }
          current = obj[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current)) {
        const index = Number(lastKey);
        if (!Number.isNaN(index) && index >= 0 && index < current.length) {
          current.splice(index, 1);
        }
      } else if (current !== null && typeof current === 'object') {
        delete (current as Record<string, unknown>)[lastKey];
      }

      this._cleanEmptyStructures(rootData, rootObjectKey);
    }

    this._storage.setItem(rootKey, JSON.stringify(rootData));
  }

  private _reviveDate(_key: string, value: unknown): unknown {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
      return new Date(value);
    }
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }
    return value;
  }

  private _cleanEmptyStructures(rootData: RootData, rootObjectKey: string): void {
    const isEmpty = (obj: unknown): boolean => {
      if (Array.isArray(obj)) {
        return obj.length === 0;
      }
      if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).length === 0;
      }
      return false;
    };

    const recursiveClean = (obj: unknown): void => {
      if (Array.isArray(obj)) {
        for (let i = obj.length - 1; i >= 0; i--) {
          if (isEmpty(obj[i])) {
            obj.splice(i, 1);
          } else if (obj[i] !== null && typeof obj[i] === 'object') {
            recursiveClean(obj[i]);
          }
        }
      } else if (obj !== null && typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        for (const key of Object.keys(record)) {
          if (isEmpty(record[key])) {
            delete record[key];
          } else if (record[key] !== null && typeof record[key] === 'object') {
            recursiveClean(record[key]);
          }
        }
      }
    };

    const rootValue = rootData[rootObjectKey]?.value;
    recursiveClean(rootValue);

    if (isEmpty(rootValue)) {
      delete rootData[rootObjectKey];
    }
  }

  private _parseKeyPath(keyPath: string): string[] {
    const regex = /[\w$-]+|\[\d+]/g;
    const matches = keyPath.matchAll(regex);
    return [...matches].map((match) =>
      match[0].startsWith('[') ? match[0].slice(1, -1) : match[0],
    );
  }
}
