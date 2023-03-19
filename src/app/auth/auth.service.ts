import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, map, tap } from 'rxjs'
import { User } from './user.model';
import { Preferences, SetOptions, GetOptions, RemoveOptions } from '@capacitor/preferences'
import { environment } from 'src/environments/environment';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean; // ? = optional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        return !!user.token
      } else {
        return false;
      }
    }));
  }
  constructor(private http: HttpClient) { }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        console.log('GETTING userId: ', user.userId)
        return user.userId;
      } else {
        return null;
      }
    }));
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
    {email: email, password: password, returnSecureToken: true}
    ).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey
  }`,{email: email, password: password, returnSecureToken: true}
  ).pipe(tap(this.setUserData.bind(this)));

  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (Number(userData.expiresIn) * 1000));
    console.log('setting user data. expirationTime value: ', expirationTime)
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
      this._user.next(user);
      this.autoLogout(user.tokenDuration);
      this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email)
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string) {
    console.log('storing user data. expirationTime value: ', tokenExpirationDate)
    const data = JSON.stringify({userId: userId, token: token, tokenExpirationDate: tokenExpirationDate, email: email});
    let opts:SetOptions = {
      key: 'authData',
      value: data
    }
    Preferences.set(opts);
  }

  autoLogin() {
    console.log('Calling autoLogin')
    let opts:GetOptions = {
      key: 'authData'
    }

    return from(Preferences.get(opts)).pipe(map(storedData => {
      if(!storedData || !storedData.value) {
        return null;
      }
      const parsedData = JSON.parse(storedData.value) as {token: string; tokenExpirationDate: string; userId: string; email: string;};
      const expirationTime = new Date(parsedData.tokenExpirationDate);
      if(expirationTime <= new Date()) {
        return null;
      }
      const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
      return user;
    }),
    tap(user => {
      if(user) {
        console.log('user id in local storage baby')
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }
    }),
    map(user => {
      console.log('no user id baby')
      return !!user;
    })
    );
  }

  logout() {
    if(this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    let opts:RemoveOptions = {
      key: 'authData'
    }
    Preferences.remove(opts)
  }

  private autoLogout(duration: number) {
    if(this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  ngOnDestroy() {
    if(this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

}
