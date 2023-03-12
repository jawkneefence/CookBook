import { Component, OnInit } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.model';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {
  recipes: Recipe[];

  constructor(private recipesService: RecipesService,
    private authService: AuthService,
    private router: Router) {

  }
  ngOnInit() {
    console.log(this.authService.isAuthenticated);
    if (!this.authService.isAuthenticated) { //Logged in?
      this.router.navigateByUrl('/auth');
    }
  }
  ionViewWillEnter() {
    this.recipes = this.recipesService.getAllRecipes();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

}
