import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Schnitzel',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Breitenlesau_Krug_Br%C3%A4u_Schnitzel.JPG/1200px-Breitenlesau_Krug_Br%C3%A4u_Schnitzel.JPG',
      ingredients: ['French Fries', 'Pork Meat', 'Salad'],
      instructions: 'Mix it all in a pot and serve raw.',
      userId: 'abc'
    },
    {
      id: 'r2',
      title: 'Spaghetti',
      imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/homemade-spaghetti-sauce-vertical-1530891369.jpg',
      ingredients: ['Pasta', 'Meat', 'Basil', 'Tomato Paste'],
      instructions: 'Mix it all in a pot and serve raw.',
      userId: 'abc'
    },
    {
      id: 'r3',
      title: 'Spaghetti',
      imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/homemade-spaghetti-sauce-vertical-1530891369.jpg',
      ingredients: ['Pasta', 'Meat', 'Basil', 'Tomato Paste'],
      instructions: 'Mix it all in a pot and serve raw.',
      userId: 'abc'
    },
    {
      id: 'r4',
      title: 'Spaghetti',
      imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/homemade-spaghetti-sauce-vertical-1530891369.jpg',
      ingredients: ['Pasta', 'Meat', 'Basil', 'Tomato Paste'],
      instructions: 'Mix it all in a pot and serve raw.',
      userId: 'abc'
    },
    {
      id: 'r5',
      title: 'Spaghetti',
      imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/homemade-spaghetti-sauce-vertical-1530891369.jpg',
      ingredients: ['Pasta', 'Meat', 'Basil', 'Tomato Paste'],
      instructions: 'Mix it all in a pot and serve raw.',
      userId: 'abc'
    }
  ];
  constructor(private authService: AuthService) { }

  getAllRecipes() {
    return [...this.recipes];
  }

  getRecipe(recipeId: string) {
    return {
      ...this.recipes.find(recipe => recipe.id === recipeId)
    };
  }

  deleteRecipe(recipeId: string) {
    this.recipes = this.recipes.filter(recipe =>recipe.id !== recipeId);
  }

  addRecipe(title: string, imageUrl: string, ingredients: string[], instructions: string) {
    const newRecipe = new Recipe(Math.random().toString(), title, imageUrl, ingredients, instructions, this.authService.userId);
    this.recipes.push(newRecipe);
  }

  updateRecipe(recipeId: string, newTitle: string, newImg: string, newIngrList: string[], newInstr: string) {
    const updatedRecipeIndex = this.recipes.findIndex(recipe => recipe.id === recipeId);
    const updatedRecipeList = [...this.recipes];
    const oldRecipe = updatedRecipeList[updatedRecipeIndex];
    updatedRecipeList[updatedRecipeIndex] = new Recipe(oldRecipe.id, newTitle, newImg, newIngrList, newInstr, oldRecipe.userId)
    this.recipes = updatedRecipeList;
  }

}
