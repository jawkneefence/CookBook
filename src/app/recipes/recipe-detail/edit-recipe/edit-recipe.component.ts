import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController } from '@ionic/angular';
import { Recipe } from '../../recipe.model';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.scss'],
})
export class EditRecipeComponent  implements OnInit {
  @Input() selectedRecipe: Recipe;
  form: FormGroup;
  arrForm: FormArray;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.arrForm = new FormArray([
      new FormControl(this.selectedRecipe.ingredients[0], {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    ]);
    if(this.selectedRecipe.ingredients.length > 1) {
      for(var i = 1; i < this.selectedRecipe.ingredients.length; i++) {
        this.arrForm.controls.push(new FormControl(this.selectedRecipe.ingredients[i], {
          updateOn: 'submit'
        }));
      }
    }

    //console.log("ingrlist length: ", this.arrForm.controls.length)

    this.form = new FormGroup({
      newTitle: new FormControl(this.selectedRecipe.title, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      newImg: new FormControl(this.selectedRecipe.imageUrl, {
        updateOn: 'blur'
      }),
      ingrList: this.arrForm,
      newInstr: new FormControl(this.selectedRecipe.instructions, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }
  onAddIngr() {
    this.arrForm.controls.push(new FormControl('', {
      updateOn: 'submit'
    }));
  }

  onRemoveIngr(index) {
    this.arrForm.removeAt(index);
  }


  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSaveChanges() {
    for(var i = 0; i < this.form.value.ingrList.length; i++) {
      if(this.form.value.ingrList[i]=='') {
        this.onRemoveIngr(i);
        console.log('null ingr removed');
      }
    }
    this.modalCtrl.dismiss( {msg: 'Saved Changes', form: this.form}, 'confirm');
  }

}
