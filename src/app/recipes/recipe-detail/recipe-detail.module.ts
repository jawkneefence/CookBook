import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeDetailPageRoutingModule } from './recipe-detail-routing.module';

import { RecipeDetailPage } from './recipe-detail.page';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RecipeDetailPageRoutingModule
  ],
  declarations: [RecipeDetailPage, EditRecipeComponent],
  entryComponents: [EditRecipeComponent]
})
export class RecipeDetailPageModule {}
