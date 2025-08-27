import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../router/protectedRoute";

import InicioCliente from "../cliente/base";
import Calificacion from "../cliente/calificanos/calificacion";
import Nosotros from "../cliente/nosotros/nosotros";
import Servicios from "../cliente/servicios/servicios";
import ServicioDetalle from "../cliente/servicios/ServicioDetalle";
import CrearCita from "../cliente/citas/crearCita";
import VerCita from "../cliente/citas/verCitas";
import ClientePerfil from "../cliente/perfil/clientePerfil";

const ClienteRoutes = () => {
    return (
        <Routes>
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
        </Routes>
    );
};

export default ClienteRoutes;
