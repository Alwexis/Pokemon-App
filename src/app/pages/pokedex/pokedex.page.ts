import { Component, OnInit, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Util } from 'src/app/classes/util';
import { PokemonLess } from 'src/app/interfaces/pokemon';
import { KeyValue } from '@angular/common';
import { IonSelect, IonButton, AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { NetworkService } from 'src/app/services/network.service';

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
  pokemonList: any = {};
  actualGenerations: Array<string> = [];
  loading = false;

  constructor(private _http: HttpClient, private _router: Router, private _cache: CacheService,
    private _alertCtrl: AlertController, private _network: NetworkService) { }

  async ngOnInit() {
    this._config = await this._cache.getConfig();
    this._networkStatus = await this._network.getNetworkStatus();
    this.loadPokemons(['1']);
    if (!this._networkStatus) {
      const alert = await this._alertCtrl.create({
        header: 'No Wi-fi',
        message: 'You are not connected to Wi-fi, you won\'t be able to play games or load more pokemon.',
        buttons: ['OK']
      })
      await alert.present();
    }
    this._network.onNetworkChange.subscribe(async (status: any) => {
      this._networkStatus = status;
      if (status.connected) {
        const alert = await this._alertCtrl.create({
          header: 'Connected to Wi-fi',
          message: 'You are now connected to Wi-fi, now you can play games and load more pokemons.',
          buttons: ['OK']
        })
        await alert.present();
      }
    });
  }

  async loadPokemons(generations: Array<string>) {
    if (this.loading) return;
    this.loading = true;
    //? Gettin' actual list
    if (!this._networkStatus) return;
    let pokemonListArray = Array.from(Object.values(this.pokemonList))
    pokemonListArray = pokemonListArray.filter((pokemon: any) => generations.includes(pokemon.generation.toString()));
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
}
