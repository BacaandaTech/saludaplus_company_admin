import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { BehaviorSubject, Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class usersService {
  private statusUpdateUsers: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public readonly currentStatusUpdateUsers: Observable<any> = this.statusUpdateUsers.asObservable();

  constructor(
    private http: HttpClientService
  ) { }

  setCurrentUpdateStatus(status:any): void {
    this.statusUpdateUsers.next(status);
  }

  getUsers(page: number, per_page?: number, query?: string): Observable<any> {
    var body: any = {};
    if (per_page) {
      body = {
        page: page,
        per_page: per_page
      }
    } else {
      body = {
        page: page,
      }
    }
    if (query) {
      body['query'] = query;
    }

    return this.http.getQuery('post', 'brand/users/', body).pipe(map((resp) => resp as any));

  }

  createUser(data:any){
    return this.http.getQuery('post', 'brand/create/users/', data).pipe(map((resp) => resp as any));
  }

  detailUser(userId:string){
    return this.http.getQuery('get', `brand/users/${userId}`,null).pipe(map((resp) => resp as any));
  }

  updateUser(userId:string,data:any){
    return this.http.getQuery('put', `brand/collaborator/${userId}`,data).pipe(map((resp) => resp as any));
  }

  deleteUser(userId:string){
    return this.http.getQuery('delete', `brand/collaborator/${userId}`,null).pipe(map((resp) => resp as any));
  }
  registerUser(form_data: FormData) {
    return this.http.getQuery('post', 'user/register/', form_data).pipe(map((resp) => resp as any));
  }
  recoverPasswrod(form_data: FormData) {
    return this.http.getQuery('post', 'user/recover-password', form_data)
  }
}