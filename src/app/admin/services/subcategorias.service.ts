import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { SubCategoria } from "../interfaces/subcategoria.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SubCategoriasService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getSubCategorias(): Observable<SubCategoria[]> {
        return this.http.get<SubCategoria[]>(`${this.baseUrl}/subCategorias`);
    }

    getSubCategoria(id: number): Observable<SubCategoria> {
        return this.http.get<SubCategoria>(`${this.baseUrl}/subCategoria/${id}`);
    }

    createSubCategoria(categoria: SubCategoria): Observable<SubCategoria> {
        return this.http.post<SubCategoria>(`${this.baseUrl}/subCategoria`, categoria);
    }

    updateSubCategoria(id: number, categoria: SubCategoria): Observable<SubCategoria> {
        return this.http.put<SubCategoria>(`${this.baseUrl}/subCategoria/${id}`, categoria);
    }

    deleteSubCategoria(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/subCategoria/${id}`);
    }
}