import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private _storage: Storage) {}

  async init(key = null, params = null) {
    await this._storage.create();
    if (key && params) { await this._storage.set(key, params); }
  }

  async get(key: string) {
    return await this._storage.get(key);
  }

  async set(key: string, data: any) {
    return await this._storage.set(key, data);
  }

  async addData(key: string, data: any) {
    return await this._storage.set(key, data) || [];
  }

  async removeData(key: string, index: number) {
    let storedData = await this._storage.get(key);
    if (storedData.constructor.toString().toLowerCase().indexOf('array') > -1) {
      storedData.splice(index, 1);
      return await this._storage.set(key, storedData);
    } else {
      await this._storage.remove(key);
    }
  }
}
