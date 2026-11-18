import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { FormaPago } from "../interfaces/formapago.interface";
import { environment } from "../../../environments/environment";
import { PaginatedResponse } from '../interfaces/pagination.interface';

@Injectable({
    providedIn: 'root'
})
export class FormasPagoService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getFormasPago(): Observable<FormaPago[]> {
        return this.http.get<FormaPago[]>(`${this.baseUrl}/formasPago`);
    }

    getFormaPago(id: number): Observable<FormaPago> {
        return this.http.get<FormaPago>(`${this.baseUrl}/formaPago/${id}`);
    }

    createFormaPago(formaPago: FormaPago): Observable<FormaPago> {
        return this.http.post<FormaPago>(`${this.baseUrl}/formasPago`, formaPago);
    }

    updateFormaPago(id: number, formaPago: FormaPago): Observable<FormaPago> {
        return this.http.put<FormaPago>(`${this.baseUrl}/formasPago/${id}`, formaPago);
    }

    deleteFormaPago(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/formaPago/${id}`);
    }

    getPaginatedFormasPago(page: number, perPage: number): Observable<PaginatedResponse<FormaPago>> {
        return this.http.get<PaginatedResponse<FormaPago>>(`${this.baseUrl}/formasPago/paginados`, {
            params: { page: page.toString(), perPage: perPage.toString() }
        });
    }

    searchFormasPago(searchTerm: string): Observable<FormaPago[]> {
        return this.http.get<FormaPago[]>(`${this.baseUrl}/formasPago/search`, {
            params: { search: searchTerm }
        });
    }
}
