import { Injectable, OnInit } from '@angular/core';
import { Pokemon, PokemonLess } from '../interfaces/pokemon';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private _storage: StorageService) {}

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
        favorites: {},
        pokemon: {},
        generationsSaved: [],
      });
    }
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
   @param { Pokemon } pokemon The pokemon being added to the favorites list.
   */
  async addFavorite(pokemon: Pokemon) {
    const cache = await this._storage.get('cache');
    if (cache.favorites.findIndex((p: PokemonLess) => p.id === pokemon.id) === -1) {
      cache.favorites.push(pokemon);
      await this._storage.set('cache', cache);
    }
  }

  /**
   @param { Pokemon } pokemon The pokemon being removed from the favorites list. 
   */
  async removeFavorite(pokemon: Pokemon) {
    const cache = await this._storage.get('cache');
    const index = cache.favorites.findIndex((p: Pokemon) => p.id === pokemon.id);
    if (index !== -1) {
      cache.favorites.splice(index, 1);
      await this._storage.set('cache', cache);
    }
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

  /**
   @param { Pokemon } pokemon The pokemon being added to the cache.
   */
  async addPokemonToCache(pokemon: Pokemon) {
    const cache = await this._storage.get('cache');
    if (!cache.pokemon.has(pokemon.id)) {
      cache.pokemon.set(pokemon.id, pokemon);
      await this._storage.set('cache', cache);
    }
  }

  /**
   @param { Array<Pokemon> } pokemonArray The array of pokemon being added to the cache. 
   */
  async addManyPokemonToCache(pokemonArray: Array<PokemonLess>) {
    const cache = await this._storage.get('cache');
    //console.log(Object.keys(pokemonArray))
    Object.keys(pokemonArray).forEach(async (pokemonKey: any) => {
      const pokemon = pokemonArray[pokemonKey];
      console.log(pokemon)
      if (!cache.pokemon.has(pokemon.id)) {
        console.log('adding to cache')
        cache.pokemon.set(pokemon.id, pokemon);
      }
    });
    console.log(cache)
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

  async getGenerationsSaved() {
    const cache = await this._storage.get('cache');
    return cache.generationsSaved;
  }

  async addGenerationSaved(generation: number) {
    const cache = await this._storage.get('cache');
    if (cache.generationsSaved.indexOf(generation) === -1) {
      cache.generationsSaved.push(generation);
      await this._storage.set('cache', cache);
    }
  }

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
