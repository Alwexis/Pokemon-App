import { Component, OnInit } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.page.html',
  styleUrls: ['./entries.page.scss'],
})
export class EntriesPage implements OnInit {

  pokemonData: any;
  specieData: any;
  pokedexEntries: any;

  constructor(private _pokemonService: PokemonService) { }

  ngOnInit() {
    this.pokemonData = this._pokemonService.getPokemonData();
    this.specieData = this._pokemonService.getSpecieData();
    this.pokedexEntries = this._pokemonService.getPokedexEntries();
  }

}
