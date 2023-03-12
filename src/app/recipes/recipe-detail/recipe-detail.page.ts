import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from '../recipes.service';
import { Recipe } from '../recipe.model';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
})
export class RecipeDetailPage implements OnInit {
  loadedRecipe: Recipe;

  constructor(
    private activatedRoute: ActivatedRoute,
    private recipesService: RecipesService,
    private ngRouter: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
    ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe( paramMap => {
      const recipeId = paramMap.get('recipeId');
      this.loadedRecipe = this.recipesService.getRecipe(recipeId);
      console.log(this.loadedRecipe)
    });
  }

  ionViewWillEnter() {

  }

  onDeleteRecipe() {
    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'Do you really want to delete this recipe?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        handler: () => {
          this.recipesService.deleteRecipe(this.loadedRecipe.id);
          this.ngRouter.navigate(['/']);
        }
      }
    ]
  }).then(alertEl => {
    alertEl.present();
  });
  }

  onEditRecipe() {
    //Edit Recipe Modal
    this.modalCtrl.create({
      component: EditRecipeComponent,
      componentProps: {selectedRecipe: this.loadedRecipe}
    })
    .then(modalElement => {
      modalElement.present();
      return modalElement.onDidDismiss();
    })
    .then(res => {
      console.log('res data: ', res.data.form, 'res role: ', res.role);
      if(res.role==='confirm') {
        //console.log('CHANGES SAVED');
        //If "Submit Changes" is pressed,
        this.loadingCtrl.create({
          message: 'Updating Recipe...'
        }).then(loadingElement => {
          loadingElement.present();
          //update recipe
          this.recipesService.updateRecipe(this.loadedRecipe.id, res.data.form.value.newTitle, res.data.form.value.newImg, res.data.form.value.ingrList, res.data.form.value.newInstr);
          this.loadedRecipe = this.recipesService.getRecipe(this.loadedRecipe.id);
          loadingElement.dismiss();
        })
      }
      this.ngRouter.navigateByUrl(`/recipes/${this.loadedRecipe.id}`, {replaceUrl:true});
    });
  }

}
