import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonMovesPageRoutingModule } from './pokemon-moves-routing.module';

import { PokemonMovesPage } from './pokemon-moves.page';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonMovesPageRoutingModule,
    SwiperModule
  ],
  declarations: [PokemonMovesPage]
})
export class PokemonMovesPageModule {}
