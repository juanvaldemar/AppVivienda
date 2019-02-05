import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { auth, User } from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import { UserInterface } from '../models/user';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
 constructor(private afsAuth: AngularFireAuth, private afs: AngularFirestore) { }


  registerUser(email: string, pass: string) {
    return new Promise((resolve, reject) => {
      this.afsAuth.auth.createUserWithEmailAndPassword(email, pass)
        .then(credential => {

          this.updateUserData(credential.user,credential.additionalUserInfo["isNewUser"]),
          resolve(credential)

        }).catch(

          err => reject(err)

          )
    });
  }

  loginEmailUser(email: string, pass: string) {
    return new Promise((resolve, reject) => {
      this.afsAuth.auth.signInWithEmailAndPassword(email, pass)
        .then(userData => resolve(userData),
        err => reject(err));
    });
  }


  loginFacebookUser() {
    return this.afsAuth.auth.signInWithPopup(new auth.FacebookAuthProvider())
      .then(credential => 
        this.updateUserData(credential.user,credential.additionalUserInfo["isNewUser"])
        )
  }



  logoutUser() {
    return this.afsAuth.auth.signOut();
  }


  isAuth() {
    return this.afsAuth.authState.pipe(map(auth => auth));
  }


  private updateUserData(user,userinfo) {

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const data: UserInterface = {
      name:user.displayName,
      email:user.email,
      photoUrl:user.photoURL,
      telefono:null

    } 
    
    if(userinfo){

    
    return userRef.set(data, { merge: true });
      
      
    }else{

    
      
    }

    }

}

  




