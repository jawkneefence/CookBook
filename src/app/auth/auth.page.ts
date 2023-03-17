import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl.create({keyboardClose: true, message: 'Logging in...'})
    .then(loadingElement => {
      loadingElement.present();
      let authObs: Observable<AuthResponseData>;
      if(this.isLogin) {
        console.log('logging in...');
        authObs = this.authService.login(email, password);
        console.log('login successful');
      } else {
        console.log('signing up...');
        authObs = this.authService.signup(email, password);
        console.log('signup successful');
      }
      console.log('test');
      authObs.subscribe({
        next: resData => {
          console.log('no problems here');
          console.log('user data: ', resData);
          this.isLoading = false;
          loadingElement.dismiss();
          this.router.navigateByUrl('/')
        },
        error: errRes => {
          loadingElement.dismiss();
          console.log("error: ", errRes.error.error.message);
          const code = errRes.error.error.message;
          let message = 'Could not sign up. Please try again later.'
          if(code =='EMAIL_EXISTS') {
            message = 'EMail address is already in use.';
          } else if (code =='EMAIL_NOT_FOUND') {
            message = 'EMail address could not be found.';
          } else if (code == 'INVALID_PASSWORD') {
            message = 'Incorrect Password.';
          } else if (code == 'TOO_MANY_ATTEMPTS_TRY_LATER') {
            message = 'Too many failed login attempts. Please try again later or reset your password.'
          }
          this.showAlert(message);
        }
      })
    });
  }

  onSubmit(form: NgForm) {
    const email = form.value.inputEmail;
    const password = form.value.inputPassword.toString();
    this.authenticate(email, password);
  }

  private showAlert(message: string) {
    this.alertCtrl.create({header: 'Authentification failed!',
    message: message,
    buttons: ['Okay']})
    .then(alertEl => {
      alertEl.present();
    })
  }

  onSwitchAuthMode() {
    this.isLogin = (!this.isLogin);
    console.log('isLogin: ', this.isLogin);
  }

}
