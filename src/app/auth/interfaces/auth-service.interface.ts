import { Observable } from 'rxjs';

export interface ISearchUser {
  _id: string;
  active: boolean;
  emailActive: boolean;
  role: ISearchRole;
  scopes: ISearchScope[];
}

export interface ISearchRole {
  _id: string;
  _key: string;
  level: number;
}

export interface ISearchScope {
  _id: string;
  _key: string;
  name: string;
}

export interface IUserId {
  _id: string;
}

export interface IAuthServiceGrpc {
  searchUserRoleScopes(userId: IUserId): Observable<ISearchUser>;
}
