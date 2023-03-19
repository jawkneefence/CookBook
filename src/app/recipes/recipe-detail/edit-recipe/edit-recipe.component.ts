import { Component, Input, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, LoadingController } from '@ionic/angular';
import { Recipe } from '../../recipe.model';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.scss'],
})
export class EditRecipeComponent  implements OnInit {
  @Input() selectedRecipe: Recipe;
  @Output() imagePick = new EventEmitter();
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;


  selectedImage: string;
  form: FormGroup;
  arrForm: FormArray;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.selectedImage  = this.selectedRecipe.imageUrl;
    //Create Form Array
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
    //Create Form Group
    this.form = new FormGroup({
      newTitle: new FormControl(this.selectedRecipe.title, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      newImg: new FormControl(this.selectedImage, {
        updateOn: 'change'
      }),
      ingrList: this.arrForm,
      newInstr: new FormControl(this.selectedRecipe.instructions, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }


  onImagePicked(imageData: string | File) {
    let imageFile;
    if(typeof imageData ==='string') {
      imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg')
    }
    else {
      imageFile = imageData;
    }
    this.form.patchValue({newImg: imageFile});
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if(!pickedFile) {
      console.log('no img selected');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
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


  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSaveChanges() {
    for(var i = 0; i < this.form.value.ingrList.length; i++) {
      if(this.form.value.ingrList[i]==='') {
        this.onRemoveIngr(i);
        console.log('null ingr removed');
      }
    }
    this.modalCtrl.dismiss( {msg: 'Saved Changes', form: this.form}, 'confirm');
  }

}
