export interface StockProducto {
    id?: number;
    stock: number;
    precio: number;
    contable: boolean;
    id_producto: number;
}

export interface StockTrupan {
    id?: number;
    stock: number;
    precio: number;
    contable: boolean;
    id_materia_prima_trupans: number;
}

export interface StockVidrio {
    id?: number;
    stock: number;
    precio: number;
    largo: number;
    alto: number;
    contable: boolean;
    id_materia_prima_vidrio: number;
}

export interface StockVarilla {
    id?: number;
    stock: number;
    precio: number;
    largo: number;
    contable: boolean;
    id_materia_prima_varilla: number;
}
export interface StockContorno {
    id?: number;
    stock: number;
    precio: number;
    contable: boolean;
    id_materia_prima_contorno: number;
}

// Common interface for shared properties
export interface BaseStock {
    stock: number;
    precio: number;
    contable: boolean;
}