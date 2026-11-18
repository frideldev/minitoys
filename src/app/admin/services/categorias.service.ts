import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Categoria } from "../interfaces/categoria.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CategoriasService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
    }
    getCategoriasporTipo(tipo: string): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.baseUrl}/categorias/tipo/${tipo}`);
    }

    getCategoria(id: number): Observable<Categoria> {
        return this.http.get<Categoria>(`${this.baseUrl}/categoria/${id}`);
    }

    createCategoria(categoria: Categoria): Observable<Categoria> {
        return this.http.post<Categoria>(`${this.baseUrl}/categoria`, categoria);
    }

    updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
        return this.http.put<Categoria>(`${this.baseUrl}/categoria/${id}`, categoria);
    }

    deleteCategoria(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/categoria/${id}`);
    }
}