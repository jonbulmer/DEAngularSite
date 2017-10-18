import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { IUser } from './users';


@Injectable()
export class UserService implements CanActivate {
    userLoggedIn: boolean = false;
    logedInUser: string;
    authUser: IUser;
    foundUser: Observable<IUser>
    private _usersUrl = 'src/api/users/user-detail.json';

    constructor( private router: Router,private _http: Http ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        return this.verifyLogin(url);
    }

    verifyLogin(url: string): boolean {
        if(this.userLoggedIn) { return true; }

        this.router.navigate(['/admin/login']);
        return false;
    }

    register(email: string,password: string) {
         this._http.post(this._usersUrl,
            {"userId": 2,"userEmail": "jon.bulmer@hotmail.com" ,"userPassword": "fullchocolatefireguard"})
    }

    verifyUser() {
        this.authUser =  {"userId": 1,"userEmail": "Diamond.Edge@test.com" ,"userPassword": "chocolatefireguard"};

        if(this.authUser) {

            this.logedInUser = this.authUser.userEmail;
            this.userLoggedIn = true;
            this.router.navigate(['/admin']); 
        }
    }

    login( loginEmail: string, loginPassword:string ) {
        if(this.getUsernameAndPassword(loginEmail, loginPassword)) {
            return true;
        };
        console.log('there');
        return false;
    }

    logout(){
        this.userLoggedIn = false;
    }

     getUsers(): Observable<IUser[]> {
        return this._http.get(this._usersUrl)
        .map((response: Response) => <IUser[]> response.json());
    }

    getUsernameAndPassword(email: string, password: string): boolean {
         this.foundUser =  this.getUsers()

         .map((users: IUser[]) => users.find(c => c.userEmail === email));
         if(this.foundUser) {
            return true;
         }    
         return false;
    };
}