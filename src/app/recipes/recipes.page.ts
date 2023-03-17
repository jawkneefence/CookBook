import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.model';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { map, of, Subscription, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit, OnDestroy{
  recipes: Recipe[];
  private recipesSub: Subscription;
  isLoading = false;
  private authSub: Subscription;

  constructor(private recipesService: RecipesService,
    private authService: AuthService,
    private router: Router) {

  }
  ngOnInit() {

    this.authSub = this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if(!isAuthenticated) {
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticated)
        }
      }),
      tap(isAuthenticated => {
        if(!isAuthenticated) {
          this.router.navigateByUrl('/auth')
        }
      })
    ).subscribe();

    this.recipesSub = this.recipesService.recipes.subscribe(recipes => {
      this.recipes = recipes;
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.recipesService.fetchRecipes().subscribe(() => {
    });
    this.isLoading = false;

  }

  ionViewDidEnter() {

  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  ngOnDestroy(): void {
    console.log('onDestroy called');
      if(this.recipesSub) {
        this.recipesSub.unsubscribe();
      }
      if(this.authSub) {
        this.authSub.unsubscribe();
      }
  }

}
