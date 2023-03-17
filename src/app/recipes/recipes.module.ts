import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipesPageRoutingModule } from './recipes-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RecipesPage } from './recipes.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipesPageRoutingModule,
    ScrollingModule
  ],
  declarations: [RecipesPage]
})
export class RecipesPageModule {}
