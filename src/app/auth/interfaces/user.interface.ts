export interface LoginResponse {
    message: string;
    data: UserData;
    access_token: string;
    token_type: string;
}

export interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    id_sucursal: number;
    id_rol: number;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    id_sucursal: number;
    id_rol: number;
    token: string;
    token_type: string;
}