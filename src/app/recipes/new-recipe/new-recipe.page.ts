import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipesService } from '../recipes.service';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.page.html',
  styleUrls: ['./new-recipe.page.scss'],
})
export class NewRecipePage implements OnInit {
  form: FormGroup;
  arrForm : FormArray;

  constructor(private recipeService: RecipesService, private router: Router) { }

  ngOnInit() {
    this.arrForm = new FormArray([
      new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    ]);

    this.form = new FormGroup({
      newTitle: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      newImg: new FormControl(null, {
        updateOn: 'blur'
      }),
      ingrList: this.arrForm,
      newInstr: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }

  ionViewWillEnter() {

  }

  onAddIngr() {
    this.arrForm.controls.push(new FormControl('', {
      updateOn: 'submit'
    }));
  }

  onRemoveIngr(index) {
    this.arrForm.removeAt(index);
  }

  onSubmitRecipe() {
    console.log('Form: ', this.form);
    for(var i = 0; i < this.form.value.ingrList.length; i++) {
      if(this.form.value.ingrList[i]=='') {
        this.onRemoveIngr(i);
        console.log('null ingr removed');
      }
    }
    console.log('updated form: ', this.form);
    this.recipeService.addRecipe(this.form.value.newTitle, this.form.value.newImg, this.form.value.ingrList, this.form.value.newInstr);
    this.router.navigate(['/']);
  }

}
