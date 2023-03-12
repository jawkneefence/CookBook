import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { RecipesService } from '../recipes.service';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.page.html',
  styleUrls: ['./new-recipe.page.scss'],
})
export class NewRecipePage implements OnInit {
  form: FormGroup;
  arrForm : FormArray;
  selectedImage: string;
  imagePick = new EventEmitter;

  constructor(private recipeService: RecipesService, private router: Router, private loadingCtrl: LoadingController) { }

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

  onPickImage() {
    if(!Capacitor.isPluginAvailable('Camera')) {
      return;
    }
    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.DataUrl
    }).then (image => {
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    }).catch(error => {
      console.log(error);
      return;
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

  onSubmitRecipe() {
    this.loadingCtrl.create({
      message: 'Uploading Recipe...'
    }).then(loadingEl => {
      loadingEl.present();
      this.recipeService.addRecipe(this.form.value.newTitle, this.form.value.newImg, this.form.value.ingrList, this.form.value.newInstr).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigate(['/']);
      })
    });
    for(var i = 0; i < this.form.value.ingrList.length; i++) {
      if(this.form.value.ingrList[i]=='') {
        this.onRemoveIngr(i);
        console.log('null ingr removed');
      }
    }


  }

}
