import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonTabsPage } from './pokemon-tabs.page';

const routes: Routes = [
  {
    path: 'pokemon-tabs',
    component: PokemonTabsPage,
    children: [
      {
        path: '',
        redirectTo: 'pokemon',
        pathMatch: 'full'
      },
      {
        path: 'pokemon',
        loadChildren: () => import('./tabs/pokemon/pokemon.module').then(m => m.PokemonPageModule)
      },
      {
        path: 'evolution-chain',
        loadChildren: () => import('./tabs/evolution-chain/pokemon-evo-chain.module').then(m => m.PokemonEvoChainPageModule)
      },
      {
        path: 'moves',
        loadChildren: () => import('./tabs/moves/pokemon-moves.module').then(m => m.PokemonMovesPageModule)
      },
      {
        path: 'location',
        loadChildren: () => import('./tabs/location/location.module').then(m => m.LocationPageModule)
      },
      {
        path: 'entries',
        loadChildren: () => import('./tabs/entries/entries.module').then(m => m.EntriesPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'pokemon-tabs/pokemon',
    pathMatch: 'full'
  },
  {
    path: 'entries',
    loadChildren: () => import('./tabs/entries/entries.module').then( m => m.EntriesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonTabsPageRoutingModule {}
