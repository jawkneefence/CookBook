import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.model';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { map, Subscription, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit, OnDestroy{
  recipes: Recipe[];
  private recipesSub: Subscription;
  isLoading = false;

  constructor(private recipesService: RecipesService,
    private authService: AuthService,
    private router: Router) {

  }
  ngOnInit() {
    if (!this.authService.isAuthenticated) { //Not logged in?
      this.router.navigateByUrl('/auth');
    }
    this.recipesSub = this.recipesService.recipes.subscribe(recipes => {
      this.recipes = recipes;
    })
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.recipesService.fetchRecipes().subscribe(() => {
      this.isLoading = false;
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  ngOnDestroy(): void {
      if(this.recipesSub) {
        this.recipesSub.unsubscribe();
      }
  }

}
