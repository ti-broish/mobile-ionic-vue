import { User, defaultUser, UserDetails } from "./types";

export class UserBuilder {

  private _user: User;

  constructor() {
    this._user = defaultUser;
  }

  /**
   * Make user from firebase login
   * 
   * @param firebaseUid - firebase sign in `response.user.uid`
   * @param firebaseIdToken - firebase sign in `response.user.getIdToken()`
   * 
   * @returns A new user 
   * 
   */
  makeUser(firebaseUid: string, firebaseIdToken: string): User {
    this._user.firebaseUid = firebaseUid
    this._user.firebaseJwt = firebaseIdToken

    return this._user;
  }

  /**
   * Make user from firebase login and registration data
   * 
   * @param firebaseUid - firebase sign in `response.user.uid`
   * @param firebaseIdToken - firebase sign in `response.user.getIdToken()`
   * @param userDetails - User details (name, email, etc.)
   * 
   * @returns A new user 
   * 
   */
  makeRegistrationUser(firebaseUid: string, firebaseIdToken: string, userDetails: UserDetails): User {
    this._user.userDetails = userDetails;
    this._user.firebaseUid = firebaseUid
    this._user.firebaseJwt = firebaseIdToken

    return this._user;
  }
}