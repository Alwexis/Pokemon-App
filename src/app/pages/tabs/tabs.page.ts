import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController } from '@ionic/angular';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  actualTab: string = 'pokedex';
  settingsModal: boolean = false;
  private config: any;
  //* Settings Form data
  settingsInputs: any = {
    language: 'en',
    saveFavoriteInCache: true,
    savePokemonInCache: false,
    saveGameScore: false,
  }

  constructor(private _animCtrl: AnimationController, private _cache: CacheService) {}

  async ngOnInit() {
    this.config = await this._cache.getConfig();
  }

  ionViewDidEnter() {
    document.getElementsByClassName('label-games')[0].setAttribute('style', 'display: none; width: 0%;');
    document.getElementsByClassName('label-favorite')[0].setAttribute('style', 'display: none; width: 0%;');
    this.actualTab = '';
    this.tabChange({tab: 'pokedex'});
  }

  turnSettingsModal() {
    this.settingsModal = !this.settingsModal;
  }

  async onSettingsSubmit() {
    await this._cache.setConfig(this.settingsInputs);
    this.turnSettingsModal();
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
