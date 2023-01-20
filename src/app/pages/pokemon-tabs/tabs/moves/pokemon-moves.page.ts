import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, IonContent } from '@ionic/angular';
import { CacheService } from 'src/app/services/cache.service';
import { MovementsService } from 'src/app/services/movements.service';
import { PokemonService } from 'src/app/services/pokemon.service';
import SwiperCore, { Autoplay, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'app-pokemon-moves',
  templateUrl: './pokemon-moves.page.html',
  styleUrls: ['./pokemon-moves.page.scss'],
})
export class PokemonMovesPage implements OnInit {

  @ViewChild(IonContent) content: IonContent | undefined;

  loading = true;
  pokemon: number = NaN;
  pokemonData: any;
  specieData: any;
  movements: any;
  seeingMovement: number = NaN;
  private _seeingMovementElement: any = null;
  private _seeingMovementSrc: any = null;
  private _playShowMovementDetailsAnimation_Element: any = null;

  constructor(private _pokemonService: PokemonService, private _cache: CacheService,
    private _movementsService: MovementsService, private _animationCtrl: AnimationController) {
    this.pokemon = this._pokemonService.getPokemonId();
    this.pokemonData = this._pokemonService.getPokemonData();
    this.specieData = this._pokemonService.getSpecieData();
    document.documentElement.style.setProperty('--movementSelected', 'false')
  }

  async ngOnInit() {
    await this._movementsService.init();
    this.movements = await this._movementsService.getMovements();
    setTimeout(() => {
      this.loading = false;
    }, 100)
  }

  async showMovementDetails(movement: number, e: any) {
    //? Gettin' the source element so we can get the shadowRoot and then the element we want to animate
    let src = e.srcElement;
    //? We need to get the ion-item element, so we keep going up the DOM tree until we find it
    while (src.tagName.toUpperCase() != 'ION-ITEM') {
      src = src.parentElement;
    }
    if (this.seeingMovement !== movement) {
      await this.content?.scrollToPoint(0, src.parentElement.offsetTop - 10, 500);
    }
    //? Checking if we are already seeing the movement details to close it
    if (this._seeingMovementElement != null || this.seeingMovement === movement) {
      await this.playArrowAnimation(false, this._seeingMovementElement)
      await this.playShownMovementDetailsAnimation(false, this._seeingMovementSrc);
      this._seeingMovementElement = null;
      this._seeingMovementSrc.setAttribute('active', false)
      if (this.seeingMovement === movement) {
        this.seeingMovement = NaN;
        this._seeingMovementSrc = null;
        return;
      }
    }
    this.seeingMovement = movement;
    this._seeingMovementSrc = src.parentElement;
    this._seeingMovementSrc.setAttribute('active', true)
    //? Now we get the element we want to animate from the shadowRoot
    //? We attach the ion-icon element to a variable, so we can rotate it back to 0deg when we close the movement details
    this._seeingMovementElement = src.shadowRoot.children[0].getElementsByClassName('item-detail-icon')[0];
    //? We create the animation and play it
    await this.playArrowAnimation(true, this._seeingMovementElement)
    await this.playShownMovementDetailsAnimation(true, src.parentElement);
  }

  async playShownMovementDetailsAnimation(selected: boolean, srcElement: any) {
    if (selected) {
      if (this._playShowMovementDetailsAnimation_Element != null) {
        await this.playShownMovementDetailsAnimation(false, this._playShowMovementDetailsAnimation_Element)
      }
      await this._animationCtrl.create()
        .addElement(srcElement)
        .duration(100)
        .iterations(1)
        .fromTo('opacity', '0.85', '1')
        .fromTo('filter', 'brightness(100%)', 'brightness(110%)')
        .afterAddWrite(() => {
          srcElement.setAttribute('selected', true)
        })
        .play();
      const detailsElement = srcElement.getElementsByClassName('movement-details')[0];
      await this._animationCtrl.create()
        .addElement(detailsElement)
        .duration(100)
        .iterations(1)
        .fromTo('height', '0px', `${detailsElement.scrollHeight}px`)
        .play();
    } else {
      const detailsElement = srcElement.getElementsByClassName('movement-details')[0];
      await this._animationCtrl.create()
        .addElement(detailsElement)
        .duration(100)
        .iterations(1)
        .fromTo('height', `${detailsElement.scrollHeight}px`, '0px')
        .play();
      await this._animationCtrl.create()
        .addElement(srcElement)
        .duration(100)
        .iterations(1)
        .fromTo('opacity', '1', '0.85')
        .fromTo('filter', 'brightness(110%)', 'brightness(92%)')
        .afterAddWrite(() => {
          srcElement.setAttribute('selected', false)
        })
        .play();
    }
  }

  async playArrowAnimation(open: boolean, element: any) {
    const animation = this._animationCtrl.create()
    .addElement(element)
    .duration(200)
    .iterations(1)
    if (open) {
      animation.fromTo('transform', 'rotate(0deg)', 'rotate(90deg)')
    } else {
      animation.fromTo('transform', 'rotate(90deg)', 'rotate(0deg)')
    }
    animation.play();
  }
}
