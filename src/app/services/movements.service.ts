import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {

  private _pokemonData: any = {};
  private _movements: any = [];
  private _config: any = {};
  
  constructor(private _pokemonService: PokemonService, private _http: HttpClient,
    private _cache: CacheService) {}

  async init() {
    this._config = await this._cache.getConfig();
    this._pokemonData = this._pokemonService.getPokemonData();
    this._movements = await this.fetchMovements();
  }

  async fetchMovements() {
    let movements: any = [];
    await this._pokemonData.moves.forEach(async (move: any) => {
      let movement: any = await firstValueFrom(this._http.get(move.move.url));
      let movementName = movement.names.filter((name: any) => name.language.name === this._config.language || name.language.name.startsWith(this._config.language))[0];
      if (movementName) {
        movementName = movementName.name;
      } else {
        //* Just in case there's no translation for the specified language, we're going to use English
        movementName = movement.names.filter((name: any) => name.language.name === 'en')[0].name;
      }
      let versionDetails: any = [];
      move.version_group_details.forEach(async (version: any) => {
        if (versionDetails.filter((detail: any) => detail.version === version.version_group.name.toLowerCase()).length > 0) {
          const actualVersionDetail = versionDetails.filter((detail: any) => detail.version === version.version_group.name.toLowerCase())[0];
          actualVersionDetail.learn_method += ` / ${version.move_learn_method.name}`;
        } else {
          const versionName = (version.version_group.name.substring(0, 1).toUpperCase() + version.version_group.name.substring(1)).replace(' ', '_');
          let fixedVersionName = ''
          version.version_group.name.split('-').forEach((part: any) => {
            fixedVersionName += part.substring(0, 1).toUpperCase() + part.substring(1) + ' ';
          });
          const learnMethodNames: any = await firstValueFrom(this._http.get(version.move_learn_method.url));
          let learnMethodName = learnMethodNames.names.filter((name: any) => name.language.name === this._config.language)[0];
          if (learnMethodName) {
            learnMethodName = learnMethodName.name;
          } else {
            //* Just in case there's no translation for the specified language, we're going to use English
            learnMethodName = learnMethodNames.names.filter((name: any) => name.language.name === 'en')[0].name;
          }
          const details = {
            level_learned_at: version.level_learned_at,
            learn_method: learnMethodName,
            version: versionName.toLowerCase(),
            fixedVersion: fixedVersionName.trim(),
          }
          versionDetails.push(details);
        }
      });
      let movementEntries = movement.flavor_text_entries.filter((entry: any) => entry.language.name === this._config.language);
      if (movementEntries.length === 0) {
        //* Just in case there's no translation for the specified language, we're going to use English
        movementEntries = movement.flavor_text_entries.filter((entry: any) => entry.language.name === 'en')
        if (movementEntries.length === 0) {
          //* If there's no English translation, we're going to display a No description available message
          movementEntries = 'No description available.';
        } else {
          movementEntries = movementEntries[0].flavor_text.replace('\n', ' ');
        }
      } else {
        movementEntries = movementEntries[0].flavor_text.replace('\n', ' ');
      }
      let movementObject = {
        id: movement.id,
        fixedName: (movementName.substring(0, 1).toUpperCase() + movementName.substring(1)).replace(/-/g, ' '), //(movement.name.substring(0, 1).toUpperCase() + movement.name.substring(1)).replace(/-/g, ' '),
        name: movementName.replace(/-/g, ' '), //movement.name.replace(/-/g, ' '),
        accuracy: movement.accuracy || 100,
        categoryFixed: movement.damage_class.name.substring(0, 1).toUpperCase() + movement.damage_class.name.substring(1),
        category: movement.damage_class.name,
        description: movementEntries,
        power: movement.power || NaN,
        pp: movement.pp,
        priority: movement.priority,
        type: movement.type.name,
        versionDetails: versionDetails,
      }
      movements.push(movementObject);
    });
    return movements;
  }

  getMovements() {
    return this._movements;
  }

  destroy() {
    this._movements = [];
    this._pokemonData = {};
  }
}
