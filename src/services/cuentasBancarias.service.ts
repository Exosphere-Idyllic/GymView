// src/services/cuentasBancarias.service.ts
// CRUD para cuentas bancarias del gimnasio

import apiClient from './api.client';

export interface CuentaBancaria {
    idCuenta: number;
    nombreBanco: string;
    numeroCuenta: string;
    tipoCuenta: string;
    titular: string;
    activa: boolean;
}

const cuentasBancariasService = {
    /** GET /api/cuentas-bancarias — solo activas (clientes) */
    async listarActivas(): Promise<CuentaBancaria[]> {
        const data = await apiClient.get<CuentaBancaria[] | any>('/cuentas-bancarias');
        return Array.isArray(data) ? data : [];
    },

    /** GET /api/cuentas-bancarias/todas — todas (admin) */
    async listarTodas(): Promise<CuentaBancaria[]> {
        const data = await apiClient.get<CuentaBancaria[] | any>('/cuentas-bancarias/todas');
        return Array.isArray(data) ? data : [];
    },

    /** POST /api/cuentas-bancarias */
    async crear(cuenta: Omit<CuentaBancaria, 'idCuenta' | 'activa'>): Promise<{ mensaje: string }> {
        return apiClient.post('/cuentas-bancarias', cuenta);
    },

    /** DELETE /api/cuentas-bancarias/{id} */
    async eliminar(id: number): Promise<{ mensaje: string }> {
        return apiClient.delete(`/cuentas-bancarias/${id}`);
    },
};

export default cuentasBancariasService;
