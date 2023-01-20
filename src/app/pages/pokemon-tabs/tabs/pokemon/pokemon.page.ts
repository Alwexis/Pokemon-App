import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { Util } from 'src/app/classes/util';
import { CacheService } from 'src/app/services/cache.service';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.page.html',
  styleUrls: ['./pokemon.page.scss'],
})
export class PokemonPage implements OnInit, OnDestroy {

  pokemon: number = NaN;
  pokemonData: any;
  specieData: any;
  typeRelations: any;
  loading: boolean = true;
  activeBar = 'about';
  isOnline: boolean= false;
  isPlayingCry: boolean = false;

  constructor(private _pokemonService: PokemonService, private _cache: CacheService,
    private _route: ActivatedRoute, private _router: Router,
    private _animationCtrl: AnimationController) {
      this.isOnline = true;
      this._route.queryParams.subscribe(params => {
        if (this._router.getCurrentNavigation()?.extras.state) {
          const extrasState: any = this._router.getCurrentNavigation()?.extras.state;
          this.pokemon = extrasState.pokemonId;
        }
      });
  }

  async ngOnInit() {
    this.loading = true;
    //! Eliminar esto después
    //await this._pokemonService.init(6);
    await this._pokemonService.init(this.pokemon);
    //! Fin Eliminar esto después
    this.pokemonData = this._pokemonService.getPokemonData();
    this.specieData = this._pokemonService.getSpecieData();
    this.typeRelations = this._pokemonService.getTypeRelations();
    // DOM
    const documentStyle = document.documentElement.style;
    documentStyle.setProperty('--actual-type-color-text', `var(--${this.pokemonData.types[0].type.name}-type-text)`);
    documentStyle.setProperty('--actual-type-color', `var(--${this.pokemonData.types[0].type.name}-type-bg)`);
    documentStyle.setProperty('--actual-type-color-selected', `var(--${this.pokemonData.types[0].type.name}-type-selected)`);
    // End DOM
    this.loading = false;
    setTimeout(async () => {
      await this.playAnimation('info-section-about');
    }, 50)
  }

  async ngOnDestroy() {
    await this._pokemonService.destroy();
  }

  async changeInfoBar(newBar: string) {
    if (this.activeBar !== newBar) {
      document.getElementById(this.activeBar)?.setAttribute('active', 'false');
      this.activeBar = newBar;
      document.getElementById(this.activeBar)?.setAttribute('active', 'true');
      setTimeout(async () => {
        await this.playAnimation('info-section-' + this.activeBar);
      }, 50)
    }
  }

  async playAnimation(section: string) {
    const element = document.getElementsByClassName(section)[0];
    const animation = this._animationCtrl.create()
      .addElement(element)
      .duration(200)
      .iterations(1)
      .fromTo('opacity', '0', '1')
    await animation.play();
  }

  async playPokemonCry() {
    if (this.isOnline && !this.isPlayingCry) {
      let cry;
      let duration = 0;
      const fixedNameForAudio = Util.getFixedNameForAudio(this.pokemonData.name);
      this.isPlayingCry = true;
      try {
        cry = new Audio('https://play.pokemonshowdown.com/audio/cries/' + fixedNameForAudio + '.mp3');
        await cry.play();
        duration = cry.duration * 1000;
        setTimeout(() => {
          this.isPlayingCry = false;
        }, duration);
        return;
      } catch (e) {}
      try {
        cry = new Audio('https://play.pokemonshowdown.com/audio/cries/' + fixedNameForAudio + '.ogg');
        await cry.play();
        duration = cry.duration * 1000;
        setTimeout(() => {
          this.isPlayingCry = false;
        }, duration);
      } catch (e) {}
    }
  }
}
