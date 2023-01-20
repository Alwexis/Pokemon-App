import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonTabsPageRoutingModule } from './pokemon-tabs-routing.module';

import { PokemonTabsPage } from './pokemon-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonTabsPageRoutingModule
  ],
  declarations: [PokemonTabsPage]
})
export class PokemonTabsPageModule {}
