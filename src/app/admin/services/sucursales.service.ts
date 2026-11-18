import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Sucursal } from "../interfaces/sucursal.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SucursalesService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getSucursales(): Observable<Sucursal[]> {
        return this.http.get<Sucursal[]>(`${this.baseUrl}/sucursales`);
    }

    getSucursal(id: number): Observable<Sucursal> {
        return this.http.get<Sucursal>(`${this.baseUrl}/sucursal/${id}`);
    }

    createSucursal(sucursal: Sucursal): Observable<Sucursal> {
        return this.http.post<Sucursal>(`${this.baseUrl}/sucursal`, sucursal);
    }

    updateSucursal(id: number, sucursal: Sucursal): Observable<Sucursal> {
        return this.http.put<Sucursal>(`${this.baseUrl}/sucursal/${id}`, sucursal);
    }

    deleteSucursal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/sucursal/${id}`);
    }
}