import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, AnimationController, NavController } from '@ionic/angular';
import { interval } from 'rxjs';
import { MovementsService } from 'src/app/services/movements.service';
import { NetworkService } from 'src/app/services/network.service';
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
  networkStatus?: boolean;
  __noWifiAlert: any = undefined;
  private subscription: any;

  constructor(private _animCtrl: AnimationController, private _pokemonService: PokemonService,
    private _movementService: MovementsService, private _network: NetworkService,
    private _alertCtrl: AlertController, private _navCtrl: NavController) {
  }

  async ngOnInit() {
    this.networkStatus = await this._network.getNetworkStatus();
    document.getElementsByClassName('label-evolution-chain')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-moves')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-location')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-entries')[0].setAttribute('style', 'display: none; width: 0%;');
    this.__noWifiAlert = await this._alertCtrl.create({
      header: 'No Wi-fi',
      message: 'You are not connected to Wi-fi, we are going to wait 5 seconds to see if the pokemon info is loaded from cache, if not, you will be redirected to the pokedex.',
      buttons: ['OK']
    });
    let alertWereShowed = false;
    let seconds = 0;
    this.subscription = interval(50).subscribe(async () => {
      seconds += 50;
      if (this._pokemonService.getInstance() !== undefined) {
        if (!this.networkStatus && !this._pokemonService.isLoadedFromCache()) {
          this.subscription.unsubscribe();
          await this.showNoConnectionAlert();
        } else {
          this.__noWifiAlert.dismiss();
          this.hasEvolution = this._pokemonService.hasEvolution();
          this.subscription.unsubscribe();
          this.loading = false;
        }
      }
      if (seconds >= 1000 && !alertWereShowed) {
        alertWereShowed = true;
        await this.__noWifiAlert.present();
      }
      if (seconds >= 4000) {
        this.subscription.unsubscribe();
        await this.showNoConnectionAlert();
      }
    });
  }

  ngOnDestroy() {
    this._pokemonService.destroy();
    this._movementService.destroy();
    this.subscription.unsubscribe();
  }

  async showNoConnectionAlert() {
    if (this.__noWifiAlert !== undefined) this.__noWifiAlert.dismiss();
    const alert = await this._alertCtrl.create({
      header: 'No Data',
      message: 'We don\'t found any data for this pokemon, you will be redirected to the pokedex.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this._navCtrl.navigateRoot('/');
        }
      }],
      backdropDismiss: false,
      cssClass: 'alert-no-wifi',
    });
    await alert.present();
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
