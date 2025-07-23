import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AirIdentifiedtEnum } from '../models/air-identification-model';
import { environment } from '../../enviroment';
import { AircraftResult, CallsigResult } from '../models/result-model';

@Injectable({
  providedIn: 'root',
})
export class AirlineFindenService {
  url = environment.baseUrl;
  constructor(private http: HttpClient) {}
  search(
    type: AirIdentifiedtEnum,
    query: string
  ): Observable<CallsigResult | AircraftResult> {
    const url = `${this.url}/${type}/${query}`;
    return this.http.get<CallsigResult | AircraftResult>(url).pipe(
      catchError((error) => {
        console.error('[AirlineFindenService]', error);
        return throwError(() => new Error('API Error'));
      })
    );
  }
}
