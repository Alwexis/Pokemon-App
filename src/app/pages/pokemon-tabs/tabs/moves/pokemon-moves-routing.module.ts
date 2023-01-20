import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonMovesPage } from './pokemon-moves.page';

const routes: Routes = [
  {
    path: '',
    component: PokemonMovesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonMovesPageRoutingModule {}
