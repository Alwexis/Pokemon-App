import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { CacheService } from './services/cache.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private _storage: Storage, private _cache: CacheService) {}

  async ngOnInit() {
    await this._storage.defineDriver(cordovaSQLiteDriver);
    await this._storage.create();
    await this._cache.init();
  }
}
