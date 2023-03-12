import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = true;
  private _userId = 'abc';

  get isAuthenticated() {
    return this._isAuthenticated;
  }
  constructor() { }

  get userId() {
    return this._userId;
  }

  login() {
    this._isAuthenticated = true;
    console.log("Logged in: ", this.isAuthenticated)
  }

  logout() {
    this._isAuthenticated = false;
    console.log("Logged out: ", this.isAuthenticated)
  }

}
