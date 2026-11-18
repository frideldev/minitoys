import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Usuario } from "../interfaces/usuario.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    getUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.baseUrl}/users`);
    }

    getUsuario(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.baseUrl}/user/${id}`);
    }

    createUsuario(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(`${this.baseUrl}/register`, usuario);
    }

    updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.baseUrl}/user/${id}`, usuario);
    }

    deleteUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/user/${id}`);
    }
}