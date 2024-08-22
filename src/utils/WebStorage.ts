class WebStorage {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  private getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  private setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  public string(key: string): string {
    return this.getItem(key) || '';
  }

  public setString(key: string, value: string): void {
    this.setItem(key, value);
  }

  public number(key: string): number {
    const value = Number(this.getItem(key) || '');

    if (isNaN(value)) return 0;

    return value;
  }

  public setNumber(key: string, value: number): void {
    this.setItem(key, value.toString());
  }

  public boolean(key: string): boolean {
    const value = this.getItem(key);

    if (value === null) return false;

    return value.toLowerCase() === 'true';
  }

  public setBoolean(key: string, value: boolean): void {
    this.setItem(key, value ? 'true' : 'false');
  }

  public object<T>(key: string): T | null {
    const value = this.getItem(key);

    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn(`Failed to parse object for key: ${key}`);
      return null;
    }
  }

  public setObject<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }

  public removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  public clear(): void {
    this.storage.clear();
  }
}

export const local = new WebStorage(globalThis.localStorage);

export const session = new WebStorage(globalThis.sessionStorage);
