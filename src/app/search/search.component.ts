import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AirIdentifiedtEnum } from '../models/air-identification-model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AircraftData,
  CallsigneData,
  SearchResult,
} from '../models/result-model';
import { AirlineFindenService } from '../sevices/airline-finden.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  noResults: boolean = false;
  error: string = '';
  hadError = false;
  loading = false;
  aircraftResults: AircraftData[] = [];
  callsignResults: CallsigneData[] = [];

  constructor(
    private fb: FormBuilder,
    private airService: AirlineFindenService
  ) {}
  form = this.fb.group({
    airIdetType: [AirIdentifiedtEnum.aircraft],
    searchName: ['', Validators.required],
  });
  ngOnInit(): void {
    this.form.get('airIdetType')?.valueChanges.subscribe(() => {
      this.aircraftResults = [];
      this.callsignResults = [];
      this.error = '';
    });
  }
  findAircraft() {
    this.loading = true;
    const selectedAirIdentify = this.form.get('airIdetType')?.value;
    const searchAirline = this.form.get('searchName')?.value?.trim();

    this.error = '';
    this.noResults = false;
    this.hadError = false;

    if (selectedAirIdentify && searchAirline) {
      const queries = searchAirline
        .split(/[\s,]+/)
        .map((data) => data.trim())
        .filter((data) => data.length > 0);

      if (queries.length === 0) {
        this.error = 'Please enter at least one valid Identify value.';
        return;
      }

      const searchAirLines = queries.map((query) =>
        this.airService.search(selectedAirIdentify, query).pipe(
          catchError((err) => {
            console.error('Failed query: ' + query, err);
            this.hadError = true;
            return of(null);
          })
        )
      );

      forkJoin(searchAirLines).subscribe((response) => {
        this.loading = false;
        const validResults = response.filter((data) => data != null);

        if (validResults.length === 0) {
          this.noResults = true;
          this.error = 'No valid results found for search.';
          return;
        }

        if (selectedAirIdentify === AirIdentifiedtEnum.aircraft) {
          const aircraftResult = validResults
            .map((res) => {
              if (res && res.response && 'aircraft' in res.response) {
                return res.response.aircraft;
              }
              return null;
            })
            .filter((item): item is AircraftData => item !== null);

          this.aircraftResults = aircraftResult;
        } else if (selectedAirIdentify === AirIdentifiedtEnum.callsign) {
          const callsignResult = validResults
            .map((res) => {
              if (res && res.response && 'flightroute' in res.response) {
                const flight = res.response.flightroute;
                if (flight && flight.origin && flight.destination) {
                  return flight;
                }
              }
              return null;
            })
            .filter((item): item is CallsigneData => item !== null);

          this.callsignResults = callsignResult;
        }

        if (this.hadError) {
          this.error = 'Some values could not be found or returned errors.';
        }

        this.form.get('searchName')?.setValue('');
      });
    } else {
      this.error = 'Please fill in all required fields.';
      this.loading = false;
    }
  }
}
