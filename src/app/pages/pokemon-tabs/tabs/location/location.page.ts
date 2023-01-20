import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { firstValueFrom } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';
import { AnimationController } from '@ionic/angular';
import SwiperCore, { Autoplay, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  loading = true;
  pokemon: number = NaN;
  pokemonData: any;
  specieData: any;
  locations: any;
  actualVersion: number = 0;
  private _actualVersion_Icon: any = null;
  private _actualVersion_SRC: any = null;

  private _swipers: Map<number, any> = new Map();

  constructor(private _pokemonService: PokemonService, private _cache: CacheService,
    private _http: HttpClient, private _animationCtrl: AnimationController) {
    this.pokemon = this._pokemonService.getPokemonId();
    this.pokemonData = this._pokemonService.getPokemonData();
    this.specieData = this._pokemonService.getSpecieData();
  }

  async ngOnInit() {
    let locationEncounters: any = await firstValueFrom(this._http.get(this.pokemonData.location_area_encounters));
    this.locations = [];
    if (locationEncounters.length < 1) {
      this.loading = false;
      return;
    };
    let _id = 0;
    let _versionId = 0;
    await Object.create(locationEncounters).forEach((location: any) => {
      const fixedName = this.fixName(location.location_area.name, '-');
      let versionsDetails: any = [];
      location.version_details.forEach((version: any) => {
        const versionName = this.fixName(version.version.name);
        const fixedVersionName = this.fixName(version.version.name, '-');
        let encounterDetails: any = [];
        version.encounter_details.forEach((encounter: any) => {
          let conditionValues: any = [];
          if (encounter.condition_values != undefined) {
            encounter.condition_values.forEach((condition: any) => {
              conditionValues.push(this.fixName(condition.name, '-'));
            });
          }
          const encounterDetail = {
            chance: encounter.chance,
            conditions: conditionValues,
            method: encounter.method.name.split('-').map((part: any) => this.fixName(part)).join(' '),
            min_level: encounter.min_level,
            max_level: encounter.max_level,
          }
          encounterDetails.push(encounterDetail);
        });
        _id++;
        const details = {
          id: _id,
          name: versionName.toLowerCase(),
          fixedName: fixedVersionName,
          max_chance: version.max_chance,
          encounter_details: encounterDetails
        };
        versionsDetails.push(details);
      });
      _versionId++;
      const locationDetail = {
        id: _versionId,
        name: fixedName,
        versionDetails: versionsDetails
      }
      this.locations.push(locationDetail);
    });
    this.loading = false;
  }

  fixName(name: string, separator?: string) {
    if (separator) {
      let fixedName = '';
      name.split(separator).forEach((part: any) => {
        fixedName += part.substring(0, 1).toUpperCase() + part.substring(1) + ' ';
      });
      return fixedName.trim();
    }
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }

  async showVersionDetails(id: number, e: any) {
    let srcElement = e.srcElement;
    while (srcElement.tagName.toUpperCase() != 'SPAN') {
      srcElement = srcElement.parentElement;
    }
    if (this.actualVersion != 0 || this.actualVersion === id) {
      await this.playArrowAnimation(false, this._actualVersion_Icon);
      await this.playShownMovementDetailsAnimation(false, this._actualVersion_SRC);
      this._actualVersion_SRC = null;
      if (this.actualVersion == id) {
        this.actualVersion = 0;
        this._actualVersion_Icon = null;
        return;
      }
    }
    this._actualVersion_Icon = srcElement.querySelector('ion-icon');
    this._actualVersion_SRC = srcElement;
    this.actualVersion = id;
    await this.playArrowAnimation(true, this._actualVersion_Icon);
    await this.playShownMovementDetailsAnimation(true, srcElement);
  }

  async playShownMovementDetailsAnimation(selected: boolean, srcElement: any) {
    if (selected) {
      if (this._actualVersion_SRC != null) {
        await this.playShownMovementDetailsAnimation(false, this._actualVersion_SRC);
      }
      await this._animationCtrl.create()
        .addElement(srcElement)
        .duration(100)
        .iterations(1)
        .fromTo('height', '0px', `${srcElement.scrollHeight}px`)
        .play();
    } else {
      await this._animationCtrl.create()
        .addElement(srcElement)
        .duration(100)
        .iterations(1)
        .fromTo('height', `${srcElement.scrollHeight}px`, '0px')
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
    await animation.play();
  }

  async didChangeVersion() {
    if (this.actualVersion != 0) {
      this.playArrowAnimation(false, this._actualVersion_Icon);
      this.actualVersion = 0;
      this._actualVersion_Icon = null;
    }
  }

  handleSwiperInstances(e: any, id: number) {
    this._swipers.set(id, e);
  }

  swiperControllerHandler(id: number, next: boolean) {
    if (next) this._swipers.get(id).slideNext(100);
    else this._swipers.get(id).slidePrev(100);
  }
}
