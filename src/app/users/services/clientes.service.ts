import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Cliente } from "../interfaces/cliente.interface";
import { environment } from "../../../environments/environment";
import { PaginatedResponse } from '../interfaces/pagination.interface';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getClientes(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.baseUrl}/clientes/fullName`);
    }

    getCliente(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.baseUrl}/clientes/${id}`);
    }

    createCliente(cliente: Cliente): Observable<Cliente> {
        return this.http.post<Cliente>(`${this.baseUrl}/cliente`, cliente);
    }

    updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.baseUrl}/cliente/${id}`, cliente);
    }

    deleteCliente(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/cliente/${id}`);
    }

    getPaginatedClientes(page: number, perPage: number): Observable<PaginatedResponse<Cliente>> {
        return this.http.get<PaginatedResponse<Cliente>>(`${this.baseUrl}/clientes/paginados`, {
            params: { page: page.toString(), perPage: perPage.toString() }
        });
    }

    searchClientes(searchTerm: string): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.baseUrl}/clientes/search`, {
            params: { search: searchTerm }
        });
    }
}