import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EntriesPageRoutingModule } from './entries-routing.module';

import { EntriesPage } from './entries.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EntriesPageRoutingModule
  ],
  declarations: [EntriesPage]
})
export class EntriesPageModule {}
