import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { interval } from 'rxjs';
import { MovementsService } from 'src/app/services/movements.service';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon-tabs',
  templateUrl: './pokemon-tabs.page.html',
  styleUrls: ['./pokemon-tabs.page.scss'],
})
export class PokemonTabsPage implements OnInit, OnDestroy {

  actualTab: string = 'pokedex';
  hasEvolution: boolean = true;
  loading: boolean = true;

  constructor(private _animCtrl: AnimationController, private _pokemonService: PokemonService,
    private _movementService: MovementsService) {
  }

  async ngOnInit() {
    document.getElementsByClassName('label-evolution-chain')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-moves')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-location')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-entries')[0].setAttribute('style', 'display: none; width: 0%;');
    const subscription = interval(50).subscribe(() => {
      if (this._pokemonService.getInstance() !== undefined) {
        this.hasEvolution = this._pokemonService.hasEvolution();
        subscription.unsubscribe();
        this.loading = false;
      }
    })
  }

  ngOnDestroy() {
    this._pokemonService.destroy();
    this._movementService.destroy();
  }

  tabChange(e: any) {
    if (this.actualTab !== e.tab) {
      this.playTabChangeAnimation(this.actualTab);
      this.playTabChangeAnimation(e.tab, true);
      this.actualTab = e.tab;
    }
  }

  playTabChangeAnimation(tab: string, reverse: boolean = false) {
    if (reverse) {
      this._animCtrl.create()
      .addElement(document.getElementsByClassName('label-' + tab)[0])
      .duration(400)
      .beforeStyles({
        'display': 'block',
      })
      .afterStyles({
        'width': '100%'
      })
      .fromTo('width', '0%', '100%')
      .iterations(1)
      .play();
    } else {
      this._animCtrl.create()
      .addElement(document.getElementsByClassName('label-' + tab)[0])
      .duration(400)
      .afterStyles({
        'display': 'none',
        'width': '0%'
      })
      .fromTo('width', '100%', '0%')
      .iterations(1)
      .play();
    }
  }
}
