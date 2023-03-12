import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { map, switchMap, take, tap, BehaviorSubject, delay, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Recipe } from './recipe.model';

interface RecipeData {
  imageUrl: string,
  ingredients: string[],
  instructions: string,
  title: string,
  userId: string
}

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private _recipes = new BehaviorSubject<Recipe[]>([])
  constructor(private authService: AuthService, private http:HttpClient, private loadingCtrl: LoadingController) { }

  fetchRecipes() {
    return this.http.get<{[key: string]: RecipeData}>(`https://mycookbook-ad00f-default-rtdb.firebaseio.com/recipeList.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
    .pipe(map(resData => {
      const fetchedRecipes = [];
      for (const key in resData) {
        if(resData.hasOwnProperty(key)) {
          fetchedRecipes.push(new Recipe(key,
            resData[key].title,
            resData[key].imageUrl,
            resData[key].ingredients,
            resData[key].instructions,
            resData[key].userId
            )
          );
        }
      }
      return fetchedRecipes;
    }),
    tap(recipes => {
      this._recipes.next(recipes);
    })
    );
  }

  get recipes() {
    return this._recipes.asObservable();
  }

  getRecipe(recipeId: string) {
    return this.http.get<RecipeData>(`https://mycookbook-ad00f-default-rtdb.firebaseio.com/recipeList.json`
    ).pipe(
      map(recipeData => {
        return new Recipe(recipeId, recipeData.title, recipeData.imageUrl, recipeData.ingredients, recipeData.instructions, recipeData.userId);
      })
    );
  }

  deleteRecipe(recipeId: string) {
    //this._recipes = this._recipes.filter(recipe =>recipe.id !== recipeId);
    /*return this.recipes.pipe(take(1), delay(750), tap( recipes => {
      this._recipes.next(recipes.filter(r => r.id !== recipeId))
    })
    );*/

    return this.http.delete(`https://mycookbook-ad00f-default-rtdb.firebaseio.com/recipeList/${recipeId}.json`
    ).pipe(switchMap(() => {
      return this.recipes
    }),
    take(1),
    tap(r => {
      this._recipes.next(r.filter(recipe => recipe.id!==recipeId));
    })
    );
  }

  addRecipe(title: string, imageUrl: string, ingredients: string[], instructions: string) {
    let generatedId: string;
    const newRecipe = new Recipe(Math.random().toString(), title, imageUrl, ingredients, instructions, this.authService.userId);
    console.log('adding recipe');

    return this.http.post<{name: string}>('https://mycookbook-ad00f-default-rtdb.firebaseio.com/recipeList.json',
    {...newRecipe, id: null})
    .pipe(switchMap(resData => {
      generatedId = resData.name;
      return this.recipes;
    }),
    take(1),
    tap(recipes => {
      newRecipe.id = generatedId;
      this._recipes.next(recipes.concat(newRecipe));
    }))
  }

  updateRecipe(recipeId: string, newTitle: string, newImg: string, newIngrList: string[], newInstr: string) {
    let updatedRecipes: Recipe[];
    return this.recipes.pipe(take(1), switchMap(recipes => {
      if(!recipes || recipes.length <= 0) {
        return this.fetchRecipes();
      } else {
        return of(recipes);
      }
    }), switchMap(recipes => {
      const updatedRecipeIndex = recipes.findIndex(r => r.id===recipeId);
      updatedRecipes = [...recipes];
      const oldRecipe = updatedRecipes[updatedRecipeIndex];
      updatedRecipes[updatedRecipeIndex] = new Recipe(
        oldRecipe.id,
        newTitle,
        newImg,
        newIngrList,
        newInstr,
        oldRecipe.userId
        );
        return this.http.put(
          `https://mycookbook-ad00f-default-rtdb.firebaseio.com/recipeList/${recipeId}.json`,
          {...updatedRecipes[updatedRecipeIndex], id: null}
          );
    }), tap(() => {
          this._recipes.next(updatedRecipes);
    })
    );

  }
}
