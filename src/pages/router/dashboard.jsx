import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../router/protectedRoute";

import BaseCrud from "../dashboard/base";
import Medicion from "../dashboard/medicion/medicion";
import GestionRoles from "../dashboard/roles/gestionRoles";
import GestionUsuarios from "../dashboard/usuarios/gestionUsuario";
import GestionInsumos from "../dashboard/insumos/gestionInsumos";
import GestionProveedores from "../dashboard/proveedores/gestionProveedor";
import GestionCompras from "../dashboard/compras/gestionCompra";
import GestionServicios from "../dashboard/servicios/gestionServicio";
import GestionManicuristas from "../dashboard/manicuristas/gestionManicurista";
import GestionAbastecimientos from "../dashboard/abastecimientos/gestionAbastecimiento";
import GestionNovedades from "../dashboard/novedades/gestionNovedades";
import GestionClientes from "../dashboard/clientes/gestionClientes";
import GestionCitas from "../dashboard/citas/gestionCitas";
import GestionVentas from "../dashboard/ventas/gestionVentas";
import GestionLiquidaciones from "../dashboard/liquidaciones/gestionLiquidaciones";
import GestionMarcas from "../dashboard/marcas/gestionMarcas";
import Perfil from "../dashboard/perfil/gestionPerfil";
import EditarPerfil from "../dashboard/perfil/editarPerfil";

const DashboardRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
                <Route path="/administrador" element={<BaseCrud />}>
                    <Route index element={<Medicion />} />
                    <Route path="roles" element={<GestionRoles />} />
                    <Route path="usuarios" element={<GestionUsuarios />} />
                    <Route path="insumos" element={<GestionInsumos />} />
                    <Route path="proveedores" element={<GestionProveedores />} />
                    <Route path="compras" element={<GestionCompras />} />
                    <Route path="servicios" element={<GestionServicios />} />
                    <Route path="manicuristas" element={<GestionManicuristas />} />
                    <Route path="abastecimientos" element={<GestionAbastecimientos />} />
                    <Route path="novedades" element={<GestionNovedades />} />
                    <Route path="clientes" element={<GestionClientes />} />
                    <Route path="citas" element={<GestionCitas />} />
                    <Route path="ventas" element={<GestionVentas />} />
                    <Route path="liquidaciones" element={<GestionLiquidaciones />} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="perfil/editarPerfil" element={<EditarPerfil />} />
                    <Route path="marcas" element={<GestionMarcas />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default DashboardRoutes;
