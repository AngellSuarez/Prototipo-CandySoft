import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../router/protectedRoute";

// Públicas
import Login from "../cuentas/login";
import Registro from "../cuentas/register";
import Recuperar1 from "../cuentas/recuperar1";
import Recuperar3 from "../cuentas/recuperar3";
import CambiarPassword from "../cuentas/CambiarPassword";

import Inicio from "../cliente/inicio/inicio";
import NosotrosInicio from "../cliente/inicio/nosotrosinicio";
import ServiciosInicio from "../cliente/inicio/servicioinicio";
import ServicioDetalleInicio from "../cliente/inicio/servicioDetalleInicio";

// Layouts Base
import BaseCrud from "../dashboard/base";
import BaseCrudMan from "../manicurista/baseMan";
import BaseCrudRec from "../recepcionista/baseRec";

// Componentes administrador
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

// Componentes manicurista
import MedicionMan from "../manicurista/medicionMan/medicionMan";
import GestionNovedadesMan from "../manicurista/novedadesMan/gestionNovedadesMan";
import GestionCitasMan from "../manicurista/citasMan/gestionCitasMan";
import GestionLiquidacionesMan from "../manicurista/liquidacionesMan/gestionLiquidacionesMan";
import GestionAbastecimientosMan from '../manicurista/abastecimientosMan/gestionAbastecimientosMan';
import PerfilMan from "../manicurista/perfilMan/gestionPerfilMan";
import EditarPerfilMan from "../manicurista/perfilMan/editarPerfilMan";

// Componentes recepcionista
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
import GestionMarcasRec from "../recepcionista/marcasRec/gestionMarcasRec";

// Componentes cliente
import InicioCliente from "../cliente/base";
import Calificacion from "../cliente/calificanos/calificacion";
import Nosotros from "../cliente/nosotros/nosotros";
import Servicios from "../cliente/servicios/servicios";
import ServicioDetalle from "../cliente/servicios/ServicioDetalle";
import CrearCita from "../cliente/citas/crearCita";
import VerCita from "../cliente/citas/verCitas";
import ClientePerfil from "../cliente/perfil/clientePerfil";

const AppRouter = () => {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registro />} />
      <Route path="/requerir-codigo" element={<Recuperar1 />} />
      <Route path="/recuperar-password" element={<Recuperar3 />} />
      <Route path="/cambiar-password" element={<CambiarPassword />} />
      <Route path="/nosotros/inicio" element={<NosotrosInicio />} />
      <Route path="/servicios/inicio" element={<ServiciosInicio />} />
      <Route path="/servicios/detalles/inicio/:id" element={<ServicioDetalleInicio />} />

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
        <Route path="/administrador/dashboard" element={<BaseCrud />}>
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

      {/* Manicurista */}
      <Route element={<ProtectedRoute allowedRoles={["Manicurista"]} />}>
        <Route path="/manicurista/dashboard" element={<BaseCrudMan />}>
          <Route index element={<MedicionMan />} />
          <Route path="novedades" element={<GestionNovedadesMan />} />
          <Route path="citas" element={<GestionCitasMan />} />
          <Route path="liquidaciones" element={<GestionLiquidacionesMan />} />
          <Route path="abastecimientos" element={<GestionAbastecimientosMan />} />
          <Route path="perfil" element={<PerfilMan />} />
          <Route path="perfil/editar" element={<EditarPerfilMan />} />
        </Route>
      </Route>

      {/* Recepcionista */}
      <Route element={<ProtectedRoute allowedRoles={["Recepcionista"]} />}>
        <Route path="/recepcionista/dashboard" element={<BaseCrudRec />}>
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
          <Route path="marcas" element={<GestionMarcasRec />} />
        </Route>
      </Route>

      {/* Cliente */}
      <Route element={<ProtectedRoute allowedRoles={["Cliente"]} />}>
        <Route path="/cliente" element={<InicioCliente />} />
        <Route path="/cliente/calificanos" element={<Calificacion />} />
        <Route path="/cliente/nosotros" element={<Nosotros />} />
        <Route path="/cliente/servicios" element={<Servicios />} />
        <Route path="/cliente/servicios/:id" element={<ServicioDetalle />} />
        <Route path="/cliente/citas/crear" element={<CrearCita />} />
        <Route path="/cliente/citas/ver" element={<VerCita />} />
        <Route path="/cliente/perfil" element={<ClientePerfil />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
};

export default AppRouter;
  