import { Component, OnInit, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { RecipesService } from '../recipes.service';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { switchMap } from 'rxjs';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.page.html',
  styleUrls: ['./new-recipe.page.scss'],
})
export class NewRecipePage implements OnInit {
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  form: FormGroup;
  arrForm : FormArray;
  selectedImage: string;
  imagePick = new EventEmitter;

  constructor(private recipeService: RecipesService, private router: Router, private loadingCtrl: LoadingController,
    private platform: Platform) { }

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
        updateOn: 'change',
        validators: [Validators.required]
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

  onImagePicked(imageData: string | File) {
    console.log('THis is getting called!!!', imageData);
    let imageFile;
    if(typeof imageData ==='string') {
      imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg')
    }
    else {
      imageFile = imageData;
    }
    this.form.patchValue({newImg: imageFile});
    console.log('After the function: ', this.form.get('newImg').value)
  }

  onFileChosen(event: Event) {

    const pickedFile = (event.target as HTMLInputElement).files[0];
    console.log('File Chosen: ', pickedFile );
    if(!pickedFile) {
      console.log('no img selected');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
      console.log('image pick: ', this.imagePick);
    }

    fr.readAsDataURL(pickedFile);
    this.onImagePicked(pickedFile);
  }

  onPickImage() {
    if(!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 270,
      resultType: CameraResultType.DataUrl
    }).then (image => {
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
      this.onImagePicked(image.dataUrl);
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
      console.log('Form newImg value: ', this.form.get('newImg').value)
      this.recipeService.uploadImage(this.form.get('newImg').value)
      .pipe(
        switchMap(uploadRes => {
          console.log('adding recipe...: ', uploadRes.imageUrl);
          return this.recipeService.addRecipe(this.form.value.newTitle, uploadRes.imageUrl, this.form.value.ingrList, this.form.value.newInstr)
        })
      ).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigate(['recipes/'])
      })
    });
    for(var i = 0; i < this.form.value.ingrList.length; i++) {
      if(this.form.value.ingrList[i]==='') {
        this.onRemoveIngr(i);
        console.log('null ingr removed');
      }
    }

  }

}
