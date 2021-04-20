import { Observable } from 'rxjs';

export interface ISearchUserScopes {
  _id: string;
}

export interface IScope {
  _id: string;
  _key: string;
  name: string;
  action: string;
  collection: string;
}

export interface IScopes {
  scopes: IScope[];
}

export interface IAuthServiceGrpc {
  searchUserScopes(data: ISearchUserScopes): Observable<IScopes>;
}
