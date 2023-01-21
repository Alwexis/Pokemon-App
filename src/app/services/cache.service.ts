import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Util } from '../classes/util';
import { Pokemon, PokemonLess } from '../interfaces/pokemon';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private _favorites: any = [];

  constructor(private _storage: StorageService, private _http: HttpClient) {}

  //? I decided to create this in order to reduce API calls when filter is applied.
  // I'll work on this later when I build the app on Android.

  async init() {
    const cache = await this._storage.get('cache');
    if (!cache) {
      await this._storage.set('cache', {
        config: {
          language: 'en',
          saveFavoriteInCache: true,
          savePokemonInCache: false,
          saveGameScore: false,
        },
        gameScore: null,
        favorites: [],
        favoritesData: {},
        pokemon: {},
        generationsSaved: [],
      });
      await this.initPokemonCacheData();
    }
    this._favorites = await this.getFavorites();
    return true;
  }

  //? Config Module //
  /**
   @description Returns a Map of the config saved in the cache, can be empty.
   @example const config = await this._cache.getConfig();
   @returns { Map<string, any> } Returns a Map of the config saved in the cache, can be empty.
   */
  async getConfig() {
    const cache = await this._storage.get('cache');
    return cache.config;
  }

  /**
   @param config The config being saved in the cache.
   @description Saves the config in the cache.
   @example await this._cache.saveConfig({ darkMode: true, language: 'en' });
   @returns { Promise<void> } Returns a Promise<void> when the config is saved.
   */
  async setConfig(config: any) {
    const cache = await this._storage.get('cache');
    cache.config = config;
    await this._storage.set('cache', cache);
  }

  //? Favorites Module //
  /**
   @returns { Array<Pokemon> } Returns an Array of Pokemon saved as favorites.
   */
  async getFavorites() {
    const cache = await this._storage.get('cache');
    if (!cache) {
      return [];
    }
    return cache.favorites;
  }

  /**
   * 
   * @param { number } id The ID of the pokemon that is being added to favorite list. 
   * @returns { Object } Returns an Object of Pokemon saved as favorites.
   */
  async getFavorite(id: number) {
    const cache = await this._storage.get('cache');
    if (!cache) {
      return null;
    }
    return cache.favoritesData[id];
  }

  /**
   @param { number } id The ID of the pokemon that is being added to favorite list.
   */
  async addFavorite(id: number) {
    const cache = await this._storage.get('cache');
    const pokemon = cache.pokemon[id]
    if (pokemon && !cache.favorites.includes(id)) {
      cache.favorites.push(id);
      this._favorites = cache.favorites;
      //cache.favoritesData[id] = await this._pokemonService.init(id, true);
      await this._storage.set('cache', cache);
    }
  }

  /**
   @param { number } id The ID of the pokemon being removed from the favorites list. 
   */
  async removeFavorite(id: number) {
    const cache = await this._storage.get('cache');
    //const index = cache.favorites.findIndex((p: Pokemon) => p.id === pokemon.id);
    if (cache.favorites.includes(id)) {
      cache.favorites = cache.favorites.filter((p: number) => p !== id);
      this._favorites = cache.favorites;
      delete cache.favoritesData[id];
      await this._storage.set('cache', cache);
    }
  }

  isFavorite(id: number) {
    return this._favorites.includes(id) ? true : false;
  }

  async __fetchPokemonToFavorite(id: number, data: any) {
    const cache = await this._storage.get('cache');
    if (cache.favorites.includes(id)) {
      cache.favoritesData[id] = data;
      await this._storage.set('cache', cache);
    }
  }

  async initPokemonCacheData() {
    const __GENS = [1, 2, 3, 4, 5, 6, 7, 8];
    let __pokemon: any = {}
    for (let gen of __GENS) {
    //__GENS.forEach(async (gen: number) => {
      const generation: any = await firstValueFrom(this._http.get(Util.getGeneration(gen)))
      for (let pokemon of generation.results) {
        const data: any = await firstValueFrom(this._http.get(pokemon.url));
        const specieData: any = await firstValueFrom(this._http.get(data.species.url));
        const name = specieData.names.find((name: any) => name.language.name === 'en');
        const pokemonInstance = {
          id: data.id,
          name: name.name,
          types: data.types.map((type: any) => type.type.name),
          // image: pokemonData.sprites.front_default,
          image: data.sprites.other.home.front_default,
          generation: gen
        }
        //await this.addPokemonToCache(pokemonInstance)
        __pokemon[pokemonInstance.id] = pokemonInstance
      }
      //const generationPromise: any = await this._http.get(Util.getGeneration(parseInt(generation))).toPromise();
    }//);
    await this.setPokemonCache(__pokemon)
  }

  //? Pokemon Module //
  /**
   @returns { Map<number, Pokemon> } Returns a Map of Pokemon saved in the cache, can be empty.
   */
  async getPokemonCache() {
    const cache = await this._storage.get('cache');
    if (!cache) {
      return new Map<number, PokemonLess>();
    }
    return cache.pokemon;
  }

  async setPokemonCache(data: any) {
    const cache = await this._storage.get('cache');
    cache.pokemon = data;
    await this._storage.set('cache', cache);
  }

  /**
   @param { Pokemon } pokemon The pokemon being added to the cache.
   */
  async addPokemonToCache(pokemon: any) {
    const cache = await this._storage.get('cache');
    if (!cache.pokemon[pokemon.id]) {
      cache.pokemon[pokemon.id] = pokemon;
      await this._storage.set('cache', cache);
    }
  }

  /**
   @param { Array<Pokemon> } pokemonArray The array of pokemon being added to the cache. 
   */
  async addManyPokemonToCache(pokemonArray: Array<PokemonLess>) {
    const cache = await this._storage.get('cache');
    Object.keys(pokemonArray).forEach(async (pokemonKey: any) => {
      const pokemon = pokemonArray[pokemonKey];
      console.log(pokemon)
      if (!cache.pokemon[pokemon.id]) {
        cache.pokemon[pokemon.id] = pokemon;
      }
    });
    await this._storage.set('cache', cache);
  }

  /**
   @param { Pokemon } pokemon The pokemon being removed from the cache. 
   */
  async removePokemonFromCache(pokemon: Pokemon) {
    const cache = await this._storage.get('cache');
    if (cache.pokemon.has(pokemon.id)) {
      cache.pokemon.delete(pokemon.id);
      await this._storage.set('cache', cache);
    }
  }

  /**
   @param { Array<Pokemon> } pokemonArray The array of pokemon being removed from the cache. 
   */
  async removeManyPokemonFromCache(pokemonArray: Array<Pokemon>) {
    const cache = await this._storage.get('cache');
    pokemonArray.forEach((pokemon: Pokemon) => {
      if (cache.pokemon.has(pokemon.id)) {
        cache.pokemon.delete(pokemon.id);
      }
    });
    await this._storage.set('cache', cache);
  }

  /**
   * @deprecated
   * @description Not saving generations in cache anymore.
   * @returns 
   */
  async getGenerationsSaved() {
    const cache = await this._storage.get('cache');
    return cache.generationsSaved;
  }

  /**
   * @deprecated
   * @description Not saving generations in cache anymore.
   * @returns 
   */
  async addGenerationSaved(generation: number) {
    const cache = await this._storage.get('cache');
    if (cache.generationsSaved.indexOf(generation) === -1) {
      cache.generationsSaved.push(generation);
      await this._storage.set('cache', cache);
    }
  }

  /**
   * @deprecated
   * @description Not saving generations in cache anymore.
   * @returns 
   */
  async removeGenerationSaved(generation: number) {
    const cache = await this._storage.get('cache');
    if (generation === 0) {
      cache.generationsSaved = [];
      await this._storage.set('cache', cache);
    } else {
      if (cache.generationsSaved.includes(generation)) {
        cache.generationsSaved = cache.generationsSaved.filter((gen: number) => gen !== generation);
        await this._storage.set('cache', cache);
      }
    }
  }
}
