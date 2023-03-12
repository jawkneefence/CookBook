import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from '../recipes.service';
import { Recipe } from '../recipe.model';
import { AlertController, ModalController, LoadingController, NavController } from '@ionic/angular';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  loadedRecipe: Recipe;
  recipesSub: Subscription;
  isLoading = false;
  recipeId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private recipesService: RecipesService,
    private ngRouter: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
    ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('recipeId')) {
        this.navCtrl.navigateBack('/recipes');
        return;
      }
      this.recipeId = paramMap.get('recipeId');
      this.isLoading = true;
      this.recipesSub = this.recipesService.getRecipe(paramMap.get('recipeId'))
      .subscribe(recipe => {
        this.loadedRecipe = recipe;
        console.log(this.loadedRecipe)
        this.isLoading = false;
      }), error => {
        this.alertCtrl.create({
          header: 'An error occurred!',
          message: 'Recipe could not be fetched. Please try again later.',
          buttons: [{text: 'Okay', handler: () => {
            this.ngRouter.navigateByUrl('/');
          }}]
        }).then(alertEl => {
          alertEl.present();
        })
      };
    })

    console.log(this.loadedRecipe)
    };


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
          this.loadingCtrl.create({message: 'Deleting Recipe...'}).then(loadingEl => {
            loadingEl.present();
            this.recipesService.deleteRecipe(this.recipeId).subscribe();
            loadingEl.dismiss();
          })

          this.ngRouter.navigate(['/']);
        }
      }
    ]
  }).then(alertEl => {
    alertEl.present();
  });
  }

  onEditRecipe() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('recipeId')) {
        this.navCtrl.navigateBack('/recipes');
        return;
      }
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
      if(res.role==='confirm') {
        //If "Submit Changes" is pressed,
        this.loadingCtrl.create({
          message: 'Updating Recipe...'
        }).then(loadingElement => {
          loadingElement.present();
          //Update recipe
          this.recipesService.updateRecipe(this.recipeId, res.data.form.value.newTitle, res.data.form.value.newImg, res.data.form.value.ingrList, res.data.form.value.newInstr).subscribe();
          loadingElement.dismiss();
        })
      }
      this.ngRouter.navigateByUrl(`/recipes`);
    });
    })
  }

  ngOnDestroy(): void {
      if(this.recipesSub) {
        this.recipesSub.unsubscribe();
      }
  }

}
