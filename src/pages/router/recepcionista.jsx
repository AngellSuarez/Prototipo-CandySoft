import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../router/protectedRoute";

import BaseCrudRec from "../recepcionista/baseRec";
import MedicionRec from "../recepcionista/medicionRec/medicionRec";
import GestionInsumosRec from "../recepcionista/insumosRec/gestionInsumosRec";
import GestionProveedoresRec from "../recepcionista/proveedoresRec/gestionProveedorRec";
import GestionComprasRec from "../recepcionista/comprasRec/gestionCompraRec";
import GestionServiciosRec from "../recepcionista/serviciosRec/gestionServicioRec";
import GestionManicuristaRec from "../recepcionista/manicuristasRec/gestionManicuristaRec";
import GestionAbastecimientosRec from "../recepcionista/abastecimientosRec/gestionAbastecimientoRec";
import GestionNovedadesRec from "../recepcionista/novedadesRec/gestionNovedadesRec";
import GestionClientesRec from "../recepcionista/clientesRec/gestionClientesRec";
import GestionCitasRec from "../recepcionista/citasRec/gestionCitasRec";
import GestionVentasRec from "../recepcionista/ventasRec/gestionVentasRec";
import GestionLiquidacionesRec from "../recepcionista/liquidacionesRec/gestionLiquidacionesRec";
import PerfilRec from "../recepcionista/perfilRec/gestionPerfilRec";
import EditarPerfilRec from "../recepcionista/perfilRec/editarPerfilRec";
import GestionMarcas from "../recepcionista/marcasRec/gestionMarcasRec";

const RecepcionistaRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={["Recepcionista"]} />}>
                <Route path="/recepcionista" element={<BaseCrudRec />}>
                    <Route index element={<MedicionRec />} />
                    <Route path="insumos" element={<GestionInsumosRec />} />
                    <Route path="proveedores" element={<GestionProveedoresRec />} />
                    <Route path="compras" element={<GestionComprasRec />} />
                    <Route path="servicios" element={<GestionServiciosRec />} />
                    <Route path="manicuristas" element={<GestionManicuristaRec />} />
                    <Route path="abastecimientos" element={<GestionAbastecimientosRec />} />
                    <Route path="novedades" element={<GestionNovedadesRec />} />
                    <Route path="clientes" element={<GestionClientesRec />} />
                    <Route path="citas" element={<GestionCitasRec />} />
                    <Route path="ventas" element={<GestionVentasRec />} />
                    <Route path="liquidaciones" element={<GestionLiquidacionesRec />} />
                    <Route path="perfil" element={<PerfilRec />} />
                    <Route path="perfil/editarPerfil" element={<EditarPerfilRec />} />
                    <Route path="marcas" element={<GestionMarcas />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default RecepcionistaRoutes;
