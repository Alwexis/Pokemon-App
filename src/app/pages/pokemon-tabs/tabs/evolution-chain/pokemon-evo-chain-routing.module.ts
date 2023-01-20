import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonEvoChainPage } from './pokemon-evo-chain.page';

const routes: Routes = [
  {
    path: '',
    component: PokemonEvoChainPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonEvoChainPageRoutingModule {}
