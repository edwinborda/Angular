import { Injectable }  from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap, startWith } from 'rxjs/operators';
import { DataSourceRequestState, toODataString } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { User } from '../models/user';
import { Message } from 'src/models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BASE_URL: string = 'https://eft.evertecinc.co:5020/';
  private readonly ENDPOINT_USER: string = 'api/users';
  private readonly ENDPOINT_ODATA_USER: string = 'odata/usersOData';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })};
  constructor(private http: HttpClient) { }

  public get(): Observable<User[]>
  {
    return this.http.get( `${this.BASE_URL}${this.ENDPOINT_USER}`).pipe(
              map((response: User[]) => response));
  }

  public getOdata(state: DataSourceRequestState): Observable<GridDataResult>
  {
    const queryStr = `${toODataString(state)}`; // Serialize the state to OData
    return this.http.get(`${this.BASE_URL}${this.ENDPOINT_ODATA_USER}?${queryStr}&$count=true`,this.httpOptions)
            .pipe(
              map((response: any) => {
                return {
                  data : response.value as User[],
                  total : response["@odata.count"]
                } as GridDataResult;
              })
            );
  }

  public add(user: User) : Observable<Message>
  { 
      return this.http.post(`${this.BASE_URL}${this.ENDPOINT_USER}`,user,this.httpOptions)
      .pipe(
        map((it) =>  {
          return {statusCode: 200, text: 'Success!!'} as Message
        }),
        catchError( err=> of(this.handleError(err)) )
      );
  }

  public update(user: User) : Observable<Message>
  { 
      return this.http.put(`${this.BASE_URL}${this.ENDPOINT_USER}/${user.Id}`, user, this.httpOptions)
      .pipe(
        map(_ => {
          return { statusCode: 200, text: 'Success!' } as Message
          })
      );
  }

  public delete(id: number)
  { 
      return this.http.delete(`${this.BASE_URL}${this.ENDPOINT_USER}/${id}`,this.httpOptions)
      .pipe(
        startWith(1),
        map(_ => { 
          return {statusCode: 200, text: 'success!!'} as Message
        }),
        catchError( err=> of(this.handleError(err)) )
      );
  }

  private handleError(error)
  {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {

      errorMessage = error.error.message;
      
    } else {
      errorMessage = error.message;
 
    }

    return {statusCode: error?.status, text: errorMessage} as Message;
  }
}
