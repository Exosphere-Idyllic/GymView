// src/services/rutinas.service.ts

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface Ejercicio {
    idEjercicio: number;
    nombre: string;
    grupoMuscular: string;
}

const rutinasService = {
    async getEjercicios(): Promise<Ejercicio[]> {
        return apiClient.get<Ejercicio[]>(
            // We use API_CONFIG or hardcode the endpoint since it was just created
            '/rutinas/ejercicios'
        );
    },

    async crearEjercicio(nombre: string, grupoMuscular: string): Promise<{ mensaje: string }> {
        return apiClient.post<{ mensaje: string }>(
            '/rutinas/ejercicios',
            { nombre, grupoMuscular }
        );
    }
};

export default rutinasService;
