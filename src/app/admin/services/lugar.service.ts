import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Lugar } from "../interfaces/lugar.interface";
import { environment } from "../../../environments/environment";
import { PaginatedResponse } from '../../users/interfaces/pagination.interface';

@Injectable({
    providedIn: 'root'
})
export class LugarService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getLugares(): Observable<Lugar[]> {
        return this.http.get<Lugar[]>(`${this.baseUrl}/lugares`);
    }

    getLugar(id: number): Observable<Lugar> {
        return this.http.get<Lugar>(`${this.baseUrl}/lugares/${id}`);
    }

    createLugar(lugar: Lugar): Observable<Lugar> {
        return this.http.post<Lugar>(`${this.baseUrl}/lugar`, lugar);
    }

    updateLugar(id: number, lugar: Lugar): Observable<Lugar> {
        return this.http.put<Lugar>(`${this.baseUrl}/lugar/${id}`, lugar);
    }

    deleteLugar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/lugar/${id}`);
    }

    getPaginatedLugares(page: number, perPage: number): Observable<PaginatedResponse<Lugar>> {
        return this.http.get<PaginatedResponse<Lugar>>(`${this.baseUrl}/lugares/paginados`, {
            params: { page: page.toString(), perPage: perPage.toString() }
        });
    }

    searchLugares(searchTerm: string): Observable<Lugar[]> {
        return this.http.get<Lugar[]>(`${this.baseUrl}/lugares/search`, {
            params: { search: searchTerm }
        });
    }
}