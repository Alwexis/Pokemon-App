import { Component, OnInit } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon-evo-chain',
  templateUrl: './pokemon-evo-chain.page.html',
  styleUrls: ['./pokemon-evo-chain.page.scss'],
})
export class PokemonEvoChainPage implements OnInit {

  pokemon: number = NaN;
  pokemonData: any;
  specieData: any;
  
  constructor(private _pokemonService: PokemonService) {
    this.pokemon = this._pokemonService.getPokemonId();
    this.pokemonData = this._pokemonService.getPokemonData();
    this.specieData = this._pokemonService.getSpecieData();
  }

  ngOnInit() {
  }

}
