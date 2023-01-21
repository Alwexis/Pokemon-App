import { Component, OnInit, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Util } from 'src/app/classes/util';
import { PokemonLess } from 'src/app/interfaces/pokemon';
import { KeyValue } from '@angular/common';
import { IonSelect, IonButton, AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { NetworkService } from 'src/app/services/network.service';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.page.html',
  styleUrls: ['./pokedex.page.scss', './../../app.component.scss'],
})
export class PokedexPage implements OnInit {

  @ViewChild('generationFilter') generationFilter: IonSelect | undefined;
  @ViewChild('generationFilterButton') generationFilterButton: IonButton | undefined
  private _completePokemonList: any = {};
  private _config: any;
  private _networkStatus: any;
  private _favoritePokemonList: any = {};
  pokemonList: any = {};
  actualGenerations: Array<string> = [];
  loading = false;

  constructor(private _http: HttpClient, private _router: Router, private _cache: CacheService,
    private _alertCtrl: AlertController, private _network: NetworkService,
    private _pokemonService: PokemonService) { }

  async ngOnInit() {
    this._config = await this._cache.getConfig();
    this._networkStatus = await this._network.getNetworkStatus();
    this._favoritePokemonList = await this._cache.getFavorites();
    this.loadPokemons(['1']);
    this._networkStatus = await this._network.getNetworkStatus();
    if (!this._networkStatus) {
      const alert = await this._alertCtrl.create({
        header: 'No Wi-fi',
        message: 'You are not connected to Wi-fi, you won\'t be able to play games or load pokemon details if you don\'t have them in cache (checkout the settings).',
        buttons: ['OK'],
      });
      await alert.present();
    }
    this._network.onNetworkChange.subscribe(async (status: any) => {
      this._networkStatus = status;
      if (status.connected) {
        const alert = await this._alertCtrl.create({
          header: 'Connected to Wi-fi',
          message: 'You are now connected to Wi-fi, now you can play games and load pokemon data.',
          buttons: ['OK']
        })
        await alert.present();
      }
    });
  }

  async loadPokemons(generations: Array<string>) {
    if (this.loading) return;
    this.loading = true;
    const __GENERATIONS = generations.map((generation: any) => parseInt(generation));
    //? Gettin' actual list
    let pokemonListArray = Array.from(Object.values(this.pokemonList))
    pokemonListArray = pokemonListArray.filter((pokemon: any) => generations.includes(pokemon.generation.toString()));
    //? Getting new list
    let cachePokemonList = await this._cache.getPokemonCache();
    if (!cachePokemonList) {
      await this._cache.initPokemonCacheData();
      cachePokemonList = await this._cache.getPokemonCache();
    }
    const cachePokemonListArray = Array.from(Object.values(cachePokemonList));
    const filteredCachePokemon = cachePokemonListArray.filter((pokemon: any) => __GENERATIONS.includes(pokemon.generation));
    const finalList = filteredCachePokemon.reduce((a: any, v: any) => ({ ...a, [v.id]: v }), {});
    this.pokemonList = finalList;
    this._completePokemonList = finalList;
    this.actualGenerations = generations;
    this.loading = false;
  }

  /**
   * @deprecated
   * @description This method is deprecated since the new cache system. It will be removed in the future.
   * @param generations 
   * @returns 
   */
  async _loadPokemons(generations: Array<string>) {
    if (this.loading) return;
    this.loading = true;
    if (!this._networkStatus) return;
    //? Gettin' actual list
    let pokemonListArray = Array.from(Object.values(this.pokemonList))
    pokemonListArray = pokemonListArray.filter((pokemon: any) => generations.includes(pokemon.generation.toString()));
    //? Getting new list
    if (this._config.savePokemonInCache) {
      const cachePokemonList = await this._cache.getPokemonCache();
      const cachePokemonListArray = Array.from(Object.values(cachePokemonList));
      generations.forEach((generation: any) => {
        if (this.actualGenerations.includes(generation)) {
          const filteredCacheList = cachePokemonListArray.filter((pokemon: any) => pokemon.generation.toString() === generation);
          if (filteredCacheList) {
            pokemonListArray = pokemonListArray.concat(filteredCacheList);
          }
        }
      });
      generations = generations.filter((generation: any) => !this.actualGenerations.includes(generation));
    }
    //?
    let newPokemonList: any = pokemonListArray.reduce((a: any, v: any) => ({ ...a, [v.id]: v }), {});
    for (let generation of generations) {
      if (!this.actualGenerations.includes(generation)) {
        const generationPromise: any = await this._http.get(Util.getGeneration(parseInt(generation))).toPromise();
        for (let pokemon of generationPromise.results) {
          const pokemonData: any = await this._http.get(pokemon.url).toPromise();
          if (this.pokemonList[pokemonData.id] == undefined) {
            const pokemonFixedName: any = Util.getFixedName(pokemonData.name);
            const pokemonInstance: PokemonLess = {
              id: pokemonData.id,
              name: pokemonFixedName.substring(0, 1).toUpperCase() + pokemonFixedName.substring(1),
              types: pokemonData.types.map((type: any) => type.type.name),
              // image: pokemonData.sprites.front_default,
              image: pokemonData.sprites.other.home.front_default,
              generation: parseInt(generation)
            }
            newPokemonList[pokemonData.id] = pokemonInstance;
          }
        }
      }
    }
    this.pokemonList = newPokemonList;
    this._completePokemonList = newPokemonList;
    this.actualGenerations = generations;
    this.loading = false;
    if (this._config.savePokemonInCache) {
      await this._cache.setPokemonCache(newPokemonList);
    }
    console.log(this.pokemonList)
    console.log(this.pokemonList.constructor)
  }

  async searchBarHandler(e: any) {
    if (e.detail.value.length > 0) {
      const pokemonListArray = Array.from(Object.values(this._completePokemonList));
      const filteredPokemonList = pokemonListArray.filter((pokemon: any) => pokemon.name.toLowerCase().includes(e.detail.value.toLowerCase()));
      this.pokemonList = filteredPokemonList.reduce((a: any, v: any) => ({ ...a, [v.id]: v }), {});
    } else {
      this.pokemonList = this._completePokemonList;
    }
  }

  seePokemonDetails(id: number) {
    const navigationExtras: NavigationExtras = {
      state: {
        pokemonId: id
      }
    };
    this._router.navigate(['/pokemon-tabs'], navigationExtras);
  }

  //? NgFor order
  indexOrderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.index;
    const b = bkv.value.index;

    return a > b ? 1 : (b > a ? -1 : 0);
  };

  //? Filter
  openGenerationFilter() {
    if (this.generationFilter) this.generationFilter.open();
  }

  async onSelectionChange() {
    if (this.generationFilter) {
      if (this.generationFilter.value?.length === 0) {
        this.generationFilter.value = ['1'];
      }
    }
    await this.loadPokemons(this.generationFilter?.value);
  }

  __isFavorite(id: any) {
    if (typeof id === 'string') id = parseInt(id);
    return this._cache.isFavorite(id);
  }

  async __turnFavorite(id: any) {
    if (typeof id === 'string') id = parseInt(id);
    if (this.__isFavorite(id)) {
      this._cache.removeFavorite(id);
    } else {
      if (this._networkStatus) {
        this._cache.addFavorite(id);
        const pokemonData = await this._pokemonService.init(id, true);
        this._cache.__fetchPokemonToFavorite(id, pokemonData);
      } else {
        const alert = await this._alertCtrl.create({
          header: 'Error',
          subHeader: 'No internet connection',
          message: 'You need to be connected to the internet to add a pokemon to your favorites & download their data.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
    //this.pokemonList[id].changed = true;
    //this.pokemonList = this.pokemonList;
    //this.pokemonList[id] = pokemon;
    //console.log(this.pokemonList)
  }
}
