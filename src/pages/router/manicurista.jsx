import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../router/protectedRoute";

import BaseCrudMan from "../manicurista/baseMan";
import MedicionMan from "../manicurista/medicionMan/medicionMan";
import GestionNovedadesMan from "../manicurista/novedadesMan/gestionNovedadesMan";
import GestionCitasMan from "../manicurista/citasMan/gestionCitasMan";
import GestionLiquidacionesMan from "../manicurista/liquidacionesMan/gestionLiquidacionesMan";
import GestionAbastecimientosMan from '../manicurista/abastecimientosMan/gestionAbastecimientosMan';
import PerfilMan from "../manicurista/perfilMan/gestionPerfilMan";
import EditarPerfilMan from "../manicurista/perfilMan/editarPerfilMan";

const ManicuristaRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={["Manicurista"]} />}>
                <Route path="/manicurista" element={<BaseCrudMan />}>
                    <Route index element={<MedicionMan />} />
                    <Route path="novedades" element={<GestionNovedadesMan />} />
                    <Route path="citas" element={<GestionCitasMan />} />
                    <Route path="liquidaciones" element={<GestionLiquidacionesMan />} />
                    <Route path="abastecimientos" element={<GestionAbastecimientosMan />} />
                    <Route path="perfil" element={<PerfilMan />} />
                    <Route path="perfil/editar" element={<EditarPerfilMan />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default ManicuristaRoutes;
