import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, interval } from 'rxjs';
import { Util } from '../classes/util';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  //? Kind of a singleton pattern
  private _instance: any = null;
  private _pokemonId: any;
  private _pokemonData: any = {};
  private _specieData: any = {};
  private _typeRelations: any = {
    double_from: [],
    double_to: [],
    half_from: [],
    half_to: [],
    no_from: [],
    no_to: []
  };
  private _evolutionChain: any = {};
  private _config: any = {};
  private _loadedFromCache: boolean = false;
  
  constructor(private _http: HttpClient, private _cache: CacheService) {}

  async init(id: number, saveToFavorite: boolean = false) {
    if (this._instance === null) {
      if (this._cache.isFavorite(id)) {
        return await this.initFromCache(id);
      }
      this._pokemonId = id;
      this._config = await this._cache.getConfig();
      //? Testing firstValueFrom
      // this._pokemonData = await this._http.get('https://pokeapi.co/api/v2/pokemon/' + id).toPromise();
      // this._specieData = await this._http.get('https://pokeapi.co/api/v2/pokemon-species/' + id).toPromise();
      this._pokemonData = await firstValueFrom(this._http.get('https://pokeapi.co/api/v2/pokemon/' + id));
      this._specieData = await firstValueFrom(this._http.get('https://pokeapi.co/api/v2/pokemon-species/' + id));
      this._evolutionChain = await this.fetchEvolutionChain(this._specieData.evolution_chain.url);
      // Type Relations
      for (let type of this._pokemonData.types) {
        const typeRelations = await this.fetchTypeRelations(type.type.url);
        const double_from_filtered = typeRelations.double_damage_from.filter((type: any) => !this._typeRelations.double_from.includes(type.name)).map((type: any) => type.name)
        double_from_filtered.forEach((type: any) => this._typeRelations.double_from.push(type));

        const double_to_filtered = typeRelations.double_damage_to.filter((type: any) => !this._typeRelations.double_to.includes(type.name)).map((type: any) => type.name)
        double_to_filtered.forEach((type: any) => this._typeRelations.double_to.push(type));
        
        const half_from_filtered = typeRelations.half_damage_from.filter((type: any) => !this._typeRelations.half_from.includes(type.name)).map((type: any) => type.name)
        half_from_filtered.forEach((type: any) => this._typeRelations.half_from.push(type));
        
        const half_to_filtered = typeRelations.half_damage_to.filter((type: any) => !this._typeRelations.half_to.includes(type.name)).map((type: any) => type.name)
        half_to_filtered.forEach((type: any) => this._typeRelations.half_to.push(type));
        
        const no_from_filtered = typeRelations.no_damage_from.filter((type: any) => !this._typeRelations.no_from.includes(type.name)).map((type: any) => type.name)
        no_from_filtered.forEach((type: any) => this._typeRelations.no_from.push(type));
        
        const no_to_filtered = typeRelations.no_damage_to.filter((type: any) => !this._typeRelations.no_to.includes(type.name)).map((type: any) => type.name)
        no_to_filtered.forEach((type: any) => this._typeRelations.no_to.push(type));
      }
      // Adding attributes to pokemonData, specieData and typeRelations
      this._specieData.growth_rate.fixedName = this._specieData.growth_rate.name.replace('-', ' ');
      const __zoneAwareeggGroups = await this._specieData.egg_groups.map(async (group: any) => {
        const eggGroup: any = await firstValueFrom(this._http.get(group.url));
        let name = eggGroup.names.filter((name: any) => name.language.name === this._config.language || name.language.name.startsWith(this._config.language))[0].name;
        if (!name) {
          name = eggGroup.names.filter((name: any) => name.language.name === 'en')[0].name;
        }
        return name.charAt(0).toUpperCase() + name.slice(1);
      });
      const eggGroups = await Promise.all(__zoneAwareeggGroups);
      this._specieData.egg_groups.asString = eggGroups.join(', ');
      this._specieData.generation.fixedName = this._specieData.generation.name.replace('generation-', ' ').toUpperCase();
      this._specieData.fixedName = this._specieData.names.filter((name: any) => name.language.name === this._config.language)[0].name;
      this._pokemonData.stats.forEach((element: any) => {
          const statInfo = Util.getStatInfo(element.stat.name);
          element.fixedName = statInfo[0];
          element.color = statInfo[1];
          element.percent = Math.round((element.base_stat * 100) / 255);
      });
      this._pokemonData.pokedex_entries = this._specieData.flavor_text_entries.filter((entry: any) => entry.language.name === this._config.language || entry.language.name.startsWith(this._config.language));
      this._pokemonData.pokedex_entry = this.getDescription(this._specieData.flavor_text_entries, this._config.language)[0];
      this._pokemonData.shownSprites = Object.values(this._pokemonData.sprites.other.home).filter((sprite: any) => sprite !== null);
      this._pokemonData.fixedName = this._pokemonData.name.charAt(0).toUpperCase() + this._pokemonData.name.slice(1);
      for (let type of this._pokemonData.types) {
        type.type.fixedName = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);
      }
      if (saveToFavorite) {
        const data = {
          pokemonData: this._pokemonData,
          specieData: this._specieData,
          evolutionChain: this._evolutionChain,
          typeRelations: this._typeRelations
        }
        this.destroy();
        return data;
      }
      this._instance = this;
      return true;
    }
    return false;
  }

  async initFromCache(id: number) {
    this._pokemonId = id;
    const completeData: any = await this._cache.getFavorite(id); 
    this._pokemonData = completeData.pokemonData;
    this._specieData = completeData.specieData;
    this._evolutionChain = completeData.evolutionChain;
    this._typeRelations = completeData.typeRelations;
    this._instance = this;
    this._loadedFromCache = true;
    return true;
  }

  isLoadedFromCache() {
    return this._loadedFromCache;
  }

  getPokemonData() {
    return this._pokemonData;
  }

  getSpecieData() {
    return this._specieData;
  }

  getPokemonId() {
    return this._pokemonId;
  }

  getDescription(pokedexEntries: [], language: string = 'en') {
    let newEntries = pokedexEntries.filter((entry: any) => entry.language.name === language || entry.language.name.startsWith(this._config.language)).map((entry: any) => entry.flavor_text.replace('', ' ').replace('\n', ' '));
    if (!newEntries.length) {
      newEntries = pokedexEntries.filter((entry: any) => entry.language.name === 'en').map((entry: any) => entry.flavor_text.replace('', ' ').replace('\n', ' '));
    }
    return newEntries;
  }
  
  async fetchTypeRelations(typeURL: string) {
    const typeRelations: any = await firstValueFrom(this._http.get(typeURL));
    return typeRelations.damage_relations;
  }

  getTypeRelations() {
    return this._typeRelations;
  }

  async fetchEvolutionChain(evolutionChainURL: string) {
    const evolutionChain: any = await firstValueFrom(this._http.get(evolutionChainURL));
    return evolutionChain.chain;
  }

  getEvolutionChain() {
    return this._evolutionChain;
  }

  hasEvolution() {
    return this._evolutionChain.evolves_to.length > 0;
  }

  getPokedexEntries() {
    return this._pokemonData.pokedex_entries;
  }

  destroy() {
    this._loadedFromCache = false;
    this._instance = null;
    this._pokemonId = NaN;
    this._pokemonData = {};
    this._specieData = {};
    this._typeRelations = {
      double_from: [],
      double_to: [],
      half_from: [],
      half_to: [],
      no_from: [],
      no_to: []
    };
    this._evolutionChain = {};
  }

  getInstance() {
    if (this._instance !== null) {
      return this._instance;
    }
  }
}
