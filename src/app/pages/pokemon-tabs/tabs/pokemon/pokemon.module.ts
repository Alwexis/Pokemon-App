import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonPageRoutingModule } from './pokemon-routing.module';

import { PokemonPage } from './pokemon.page';

import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonPageRoutingModule,
    SwiperModule
  ],
  declarations: [PokemonPage]
})
export class PokemonPageModule {}
