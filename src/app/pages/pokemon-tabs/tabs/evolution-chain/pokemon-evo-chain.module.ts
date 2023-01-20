import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonEvoChainPageRoutingModule } from './pokemon-evo-chain-routing.module';

import { PokemonEvoChainPage } from './pokemon-evo-chain.page';
import { EvolutionchainComponent } from "../../../../components/evolutionchain/evolutionchain.component";
import { SwiperModule } from 'swiper/angular';

@NgModule({
    declarations: [PokemonEvoChainPage, EvolutionchainComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PokemonEvoChainPageRoutingModule,
        SwiperModule
    ]

})
export class PokemonEvoChainPageModule {}
