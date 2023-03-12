import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from './auth.service';

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
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    console.log(this.authService.isAuthenticated);
  }

  onLogin() {
    this.isLoading = true;
    this.loadingCtrl.create({keyboardClose: true, message: 'Logging in...'})
    .then(loadingElement => {
      loadingElement.present();
      setTimeout(() => {
        this.isLoading = false;
        loadingElement.dismiss();
        this.router.navigateByUrl('/');
      }, 500);
    });
    this.authService.login();
  }

  onSubmit(form: NgForm) {
    const email = form.value.inputEmail;
    const password = form.value.inputPassword;
  }

  onSwitchAuthMode() {
    this.isLogin = (!this.isLogin);
  }

}
