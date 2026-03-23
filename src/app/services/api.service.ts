import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { TransferStateService } from './transfer-state.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    baseUrl = 'http://139.84.208.244/api/';
    imageUrl = 'https://pub-dc43a3b1162c478daad951298078ab42.r2.dev/'
    constructor(
        private http: HttpClient,
        private state: TransferStateService
    ) { }

    get<T>(url: string, cacheKey?: string): Observable<T> {

        const cached = cacheKey ? this.state.get<T>(cacheKey) : null;

        if (cached) {
            return new Observable(obs => {
                obs.next(cached);
                obs.complete();
            });
        }

        return this.http.get<T>(this.baseUrl + url).pipe(

            tap(res => {
                if (cacheKey) this.state.set(cacheKey, res);
            }),

            catchError(this.handleError)
        );
    }

    post<T>(url: string, payload: any): Observable<T> {

        return this.http.post<T>(this.baseUrl + url, payload)
            .pipe(catchError(this.handleError));
    }

    put<T>(url: string, payload: any): Observable<T> {

        return this.http.put<T>(this.baseUrl + url, payload)
            .pipe(catchError(this.handleError));
    }

    delete<T>(url: string): Observable<T> {

        return this.http.delete<T>(this.baseUrl + url)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {

        let message = 'Something went wrong';

        if (error?.error?.message) {
            message = error.error.message;
        }

        return throwError(() => message);
    }

}