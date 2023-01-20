import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Util } from 'src/app/classes/util';
import { PokemonService } from 'src/app/services/pokemon.service';
import SwiperCore, { Autoplay, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'evolution-chain',
  templateUrl: './evolutionchain.component.html',
  styleUrls: ['./evolutionchain.component.scss'],
})

export class EvolutionchainComponent implements OnInit {

  loading: boolean = true;
  evolutionChain: any;
  formatedEvolutionChain: Array<any> = [];
  private _swiper: any;

  constructor(private _pokemonService: PokemonService, private _http: HttpClient) {}

  async ngOnInit() {
    this.loading = true;
    this.evolutionChain = await this._pokemonService.getEvolutionChain();
    this.formatedEvolutionChain = await this.formatEvolutionChain();
    this.loading = false;
  }

  setSwiperInstance(swiper: any) {
    this._swiper = swiper;
  }

  async formatEvolutionChain() {
    const evolvesTo = this.evolutionChain.evolves_to;
    const firstSlabonName = Util.getFixedName(this.evolutionChain.species.name);
    const firstSlabonData = await firstValueFrom(this._http.get('https://pokeapi.co/api/v2/pokemon/' + this.evolutionChain.species.name));
    let evolutions: Array<any> = [];
    if (evolvesTo.length > 0) {
      //? In case the pokemon has more than one evolution chain, like eevee or ralts.
      await evolvesTo.forEach(async (evolution: any) => {
        let slabonName = Util.getFixedName(evolution.species.name);
        const evolutionDetailsKeys = Object.keys(evolution.evolution_details[0]);
        const evolutionDetails: any = [];
        let evolutionTrigger = '';
        const evolutionTriggers: any = [];
        evolutionDetailsKeys.forEach((key: string) => {
          if (evolution.evolution_details[0][key] && key != 'trigger' && key != 'item' && key != 'held_item') {
            let value = evolution.evolution_details[0][key];
            evolutionDetails.push({ name: key.replace(/_-/g, ' '), value: value })
          } else if (key == 'trigger') {
            let value = evolution.evolution_details[0][key].name;
            //evolutionTrigger = value;
            evolutionTriggers.push(value);
          } else if (key == 'item' && evolution.evolution_details[0][key]) {
            evolutionDetails.push({ name: key.replace(/_-/g, ' '), value: evolution.evolution_details[0][key].name })
          } else if (key == 'held_item' && evolution.evolution_details[0][key]) {
            evolutionDetails.push({ name: key.replace(/_-/g, ' '), value: evolution.evolution_details[0][key].name })
          }
        })
        //slabonData.name = slabonName || '';
        let fetchedData: any = await firstValueFrom(this._http.get('https://pokeapi.co/api/v2/pokemon/' + evolution.species.name));
        //slabonData.sprite = fetchedData.sprites.other.home.front_default;
        //? In case the pokemon has more than two evolutions.
        let evolutionData: Array<any> = [];
        evolution.evolves_to.forEach(async (thirdEvolution: any) => {
          const thirdEvolutionDetailsKeys = Object.keys(thirdEvolution.evolution_details[0]);
          const thirdEvolutionDetails: any = [];
          let thirdEvolutionTrigger = '';
          const thirdEvolutionTriggers: any = [];
          thirdEvolutionDetailsKeys.forEach((key: string) => {
            if (thirdEvolution.evolution_details[0][key] && key != 'trigger' && key != 'item' && key != 'held_item') {
              thirdEvolutionDetails.push({ name: key, value: thirdEvolution.evolution_details[0][key] })
            } else if (key == 'trigger') {
              //thirdEvolutionTrigger = evolution.evolution_details[0][key].name;
              thirdEvolutionTriggers.push(thirdEvolution.evolution_details[0][key].name);
            } else if (key == 'item' && thirdEvolution.evolution_details[0][key]) {
              thirdEvolutionDetails.push({ name: key, value: thirdEvolution.evolution_details[0][key].name.replace('-', ' ').replace('_', ' ') })
            } else if (key == 'held_item' && thirdEvolution.evolution_details[0][key]) {
              thirdEvolutionDetails.push({ name: key, value: thirdEvolution.evolution_details[0][key].name.replace('-', ' ').replace('_', ' ') })
            }
          })
          let evolutionName: any = Util.getFixedName(thirdEvolution.species.name);
          let lastEvolutionData: any = await firstValueFrom(this._http.get('https://pokeapi.co/api/v2/pokemon/' + thirdEvolution.species.name));
          let evolutionObject = { name: evolutionName, trigger: thirdEvolutionTriggers.join(', '), details: thirdEvolutionDetails, data: lastEvolutionData };
          evolutionData.push(evolutionObject);
        });
        evolutions.push({ name: slabonName, trigger: evolutionTriggers.join(', '), details: evolutionDetails, data: fetchedData, evolution: evolutionData });
      });
    }
    let evolutionChain: Array<any> = [
      { name: firstSlabonName, data: firstSlabonData, evolution: evolutions }
    ];
    console.log(evolutionChain)
    return evolutionChain;
  }

}
