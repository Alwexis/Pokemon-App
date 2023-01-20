import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/pokedex',
        pathMatch: 'full'
      },
      {
        path: 'pokedex',
        loadChildren: () => import('../pokedex/pokedex.module').then(m => m.PokedexPageModule)
      },
      {
        path: 'games',
        loadChildren: () => import('../games/games.module').then(m => m.GamesPageModule)
      },
      {
        path: 'favorite',
        loadChildren: () => import('../favorite/favorite.module').then(m => m.FavoritePageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/pokedex',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
