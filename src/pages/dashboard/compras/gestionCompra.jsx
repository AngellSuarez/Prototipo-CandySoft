import React, { useEffect, useState } from "react";
import "../../../css/gestionar.css";
import "../../../css/compras.css";
import { AiOutlineEye, AiFillFilePdf, AiOutlineCheck } from "react-icons/ai";
import { MdBlock } from "react-icons/md";
import Swal from 'sweetalert2';
import { useTheme } from "../../tema/ThemeContext";
import { Link } from "react-router-dom";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../../img/Logo.jpg"
import { listar_compras, cambiar_estado_compra, obtenerInsumos, obtenerProveedores, crear_compra } from "../../../services/compras_service";

const GestionCompras = () => {
    const [compras, setCompras] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const comprasPorPagina = 4;

    const [isVerModalOpen, setIsVerModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [insumosCompra, setInsumosCompra] = useState([]);
    const [indiceEditando, setIndiceEditando] = useState(null);
    const [editandoDesdeItems, setEditandoDesdeItems] = useState(false);
    const [indiceEditandoItem, setIndiceEditandoItem] = useState(null);


    const exportarPDF = (compraId) => {
        const modal = document.getElementById("factura-modal");
        if (!modal) return;

        const originalStyle = modal.getAttribute("style");
        modal.style.maxHeight = "none";
        modal.style.overflow = "visible";

        const btnVolver = modal.querySelector(".ocultar-al-exportar");
        if (btnVolver) btnVolver.classList.add("ocultar-en-pdf");

        html2canvas(modal, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            windowWidth: modal.scrollWidth,
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("landscape", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvasWidthMM = canvas.width * 0.264583;
            const canvasHeightMM = canvas.height * 0.264583;
            const scale = Math.min(pdfWidth / canvasWidthMM, pdfHeight / canvasHeightMM);

            const renderWidth = canvasWidthMM * scale;
            const renderHeight = canvasHeightMM * scale;

            const marginX = (pdfWidth - renderWidth) / 2;
            const marginY = (pdfHeight - renderHeight) / 2;

            pdf.addImage(imgData, "PNG", marginX, marginY, renderWidth, renderHeight);
            pdf.save(`Factura_compra_${compraId}.pdf`);

            if (btnVolver) btnVolver.classList.remove("ocultar-en-pdf");

            if (originalStyle !== null) {
                modal.setAttribute("style", originalStyle);
            } else {
                modal.removeAttribute("style");
            }
        });
    };

    const { darkMode } = useTheme();

    const fetchCompras = async () => {
        const data = await listar_compras();
        setCompras(data);
    };

    useEffect(() => {
        fetchCompras();
    }, []);


    const [proveedores, setProveedores] = useState([]);

    useEffect(() => {
        fetch("https://angelsuarez.pythonanywhere.com/api/proveedor/proveedores/")
            .then(res => res.json())
            .then(data => setProveedores(data));
    }, []);

    const buscarProveedorPorId = (id) => {
        return proveedores.find((prov) => prov.id === id);
    };

    const obtenerNombreProveedor = (proveedor) => {
        if (!proveedor) return "Proveedor no encontrado";

        if (proveedor.tipo_persona === "NATURAL") {
            return `${proveedor.nombre_representante} ${proveedor.apellido_representante}`;
        }

        if (proveedor.tipo_persona === "JURIDICA") {
            return proveedor.nombre_empresa || "Empresa sin nombre";
        }

        return "Proveedor desconocido";
    };

    const [insumos, setInsumos] = useState([]);

    useEffect(() => {
        fetch("https://angelsuarez.pythonanywhere.com/api/insumo/insumos/")
            .then(res => res.json())
            .then(data => setInsumos(data));
    }, []);

    const buscarInsumoPorId = (id) => {
        return insumos.find((insumo) => insumo.id === id);
    };

    const [compraInsumos, setCompraInsumos] = useState([]);

    const obtenerCompraInsumosPorCompra = async (compra_id) => {
        try {
            const res = await fetch(`https://angelsuarez.pythonanywhere.com/api/compras/compra-insumos/?compra_id=${compra_id}`);
            if (!res.ok) throw new Error("Error al cargar insumos");
            return await res.json();
        } catch (error) {
            console.error("Error:", error);
            return [];
        }
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };

    const comprasFiltrados = compras.filter(compra =>
        Object.values(compra).some(valor =>
            String(valor).toLowerCase().includes(busqueda)
        )
    );

    const indexUltimo = paginaActual * comprasPorPagina;
    const indexPrimero = indexUltimo - comprasPorPagina;
    const comprasActuales = comprasFiltrados.slice(indexPrimero, indexUltimo);
    const totalPaginas = Math.ceil(comprasFiltrados.length / comprasPorPagina);

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return;
        setPaginaActual(numero);
    };

    const openVerModal = async (compra) => {
        const insumosCompra = await obtenerCompraInsumosPorCompra(compra.id);
        setCompraSeleccionada(compra);
        setCompraInsumos(insumosCompra);
        setIsVerModalOpen(true);
    };

    const closeVerModal = () => {
        setIsVerModalOpen(false);
        setCompraSeleccionada(null);
        setInsumosCompra([]);
    };

    const completarCompra = async (compra) => {
        try {
            const confirm = await Swal.fire({
                title: '¿Completar compra?',
                text: `¿Estás seguro de completar la compra #${compra.id}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, completar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                customClass: {
                    popup: 'swal-rosado'
                }
            });

            if (confirm.isConfirmed) {
                await cambiar_estado_compra(compra.id, 3); // 3 = Completada
                Swal.fire({
                    title: 'Completada',
                    text: `Compra completada correctamente`,
                    icon: 'success',
                    customClass: {
                        popup: 'swal-rosado'
                    }
                });
                const data = await listar_compras();
                setCompras(data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo completar la compra',
                icon: 'error',
                customClass: {
                    popup: 'swal-rosado'
                }
            });
        }
    };

    const anularCompra = async (compra) => {
        try {
            const confirm = await Swal.fire({
                title: '¿Cancelar compra?',
                text: `¿Estás seguro de cancelar la compra #${compra.id}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No',
                reverseButtons: true,
                customClass: {
                    popup: 'swal-rosado'
                }
            });

            if (!confirm.isConfirmed) return;

            const { value: observacion } = await Swal.fire({
                title: 'Motivo de cancelación',
                input: 'textarea',
                inputLabel: 'Escribe el motivo por el cual se cancela esta compra',
                inputPlaceholder: 'Motivo...',
                inputAttributes: {
                    'aria-label': 'Motivo de cancelación'
                },
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: 'Guardar motivo',
                cancelButtonText: 'Cancelar',
                customClass: {
                    popup: 'swal-rosado'
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debes ingresar un motivo';
                    }
                }
            });

            if (!observacion) return;

            await cambiar_estado_compra(compra.id, 4, observacion);

            Swal.fire({
                title: 'Cancelada',
                text: 'Compra cancelada correctamente',
                icon: 'success',
                customClass: {
                    popup: 'swal-rosado'
                }
            });

            const data = await listar_compras();
            setCompras(data);

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cancelar la compra',
                icon: 'error',
                customClass: {
                    popup: 'swal-rosado'
                }
            });
        }
    };

    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
    const [formCompra, setFormCompra] = useState({ proveedor: '', fecha_ingreso: '', fecha_compra: '' });
    const [erroresCompra, setErroresCompra] = useState({});
    const [showIngresoDateInput, setShowIngresoDateInput] = useState(false);
    const [showCompraDateInput, setShowCompraDateInput] = useState(false);
    const [insumosEnModal, setInsumosEnModal] = useState([]);
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState(0);
    const [cantidad, setCantidad] = useState('');
    const [errorInsumo, setErrorInsumo] = useState('');
    const [errorCantidad, setErrorCantidad] = useState('');
    const [errorPrecio, setErrorPrecio] = useState('');
    const [errorInsumosCompra, setErrorInsumosCompra] = useState('');
    const [items, setItems] = useState([]);


    const total = insumosEnModal.reduce((sum, i) => {
        const precio = parseFloat(i.precioUnitario) || 0;
        const cant = parseFloat(i.cantidad) || 0;
        return sum + precio * cant;
    }, 0);


    const closeCrearModal = () => {
        setIsCrearModalOpen(false);

        setFormCompra({
            proveedor: "",
            fecha_ingreso: "",
            fecha_compra: "",
        });

        setErroresCompra({});
        setItems([]);
        setErrorInsumosCompra("");

        setShowIngresoDateInput(false);
        setShowCompraDateInput(false);

        setInsumosEnModal([]);
        setModoEdicionIndex(null);
        resetCampos();
        setPasoActual(1);
    };

    const resetCampos = () => {
        setInsumoSeleccionado(null);
        setInputInsumoNombre("");
        setPrecioUnitario(1);
        setCantidad("");
        setErrorInsumoSeleccionado("");
        setErrorCantidad("");
        setErrorPrecio("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormCompra(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validarCampo(name, value);
    };

    const validarCampo = (name, value) => {
        const nuevosErrores = { ...erroresCompra };
        if (!value) {
            nuevosErrores[name] = 'Este campo es obligatorio';
        } else {
            delete nuevosErrores[name];
        }
        setErroresCompra(nuevosErrores);
    };

    const guardarInsumosDelModal = () => {
        if (insumosEnModal.length === 0) {
            let errores = false;

            if (!insumoSeleccionado) {
                setErrorInsumo("El insumo es obligatorio");
                errores = true;
            }

            if (precioUnitario === "" || isNaN(precioUnitario) || precioUnitario < 1) {
                setErrorPrecio("El precio debe ser mayor o igual a 1");
                errores = true;
            } else {
                setErrorPrecio("");
            }

            if (cantidad === "" || isNaN(cantidad) || cantidad < 0) {
                setErrorCantidad("La cantidad debe ser mayor o igual a 0");
                errores = true;
            }

            setErrorInsumosCompra('Debes agregar al menos un insumo');

            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });

            return;
        }

        setInsumos(insumosEnModal);
        setShowModal(false);
        setItems(prevItems => [...prevItems, ...insumosEnModal]);
        setInsumosEnModal([]);
        setShowModal(false);
        setErrorInsumosCompra('');
    };

    const agregarInsumoAlModal = () => {
        let tieneError = false;

        if (!insumoSeleccionado) {
            setErrorInsumo("El insumo es obligatorio");
            tieneError = true;
        }

        if (precioUnitario === "" || isNaN(precioUnitario) || precioUnitario < 1) {
            setErrorPrecio("El precio debe ser mayor o igual a 1");
            tieneError = true;
        } else {
            setErrorPrecio("");
        }

        if (cantidad === "" || isNaN(cantidad) || cantidad < 0) {
            setErrorCantidad("La cantidad debe ser mayor o igual a 0");
            tieneError = true;
        } else {
            setErrorCantidad("");
        }

        if (tieneError) return;

        const nuevoInsumo = {
            id: insumoSeleccionado.id,
            nombre: insumoSeleccionado.nombre,
            precioUnitario: parseFloat(precioUnitario),
            cantidad: parseFloat(cantidad)
        };

        setInsumos([...insumos, nuevoInsumo]);
        setInsumosEnModal([...insumosEnModal, nuevoInsumo]);
        setInsumoSeleccionado("");
        setPrecioUnitario(1);
        setCantidad("");
        setErrorInsumo("");
        setErrorCantidad("");
    };

    const validarCantidad = () => {
        if (cantidad === "" || isNaN(cantidad) || Number(cantidad) < 0) {
            setErrorCantidad("La cantidad debe ser mayor o igual a 0");
        } else {
            setErrorCantidad("");
        }
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formCompra.proveedor || !formCompra.fecha_ingreso || !formCompra.fecha_compra) {
            setErroresCompra({
                proveedor: !formCompra.proveedor ? 'Selecciona un proveedor' : '',
                fecha_ingreso: !formCompra.fecha_ingreso ? 'La fecha es obligatoria' : '',
                fecha_compra: !formCompra.fecha_compra ? 'La fecha es obligatoria' : '',
            });

            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                text: 'Por favor completa todos los campos requeridos.',
                customClass: { popup: 'swal-rosado' }
            });
            setLoading(false);
            return;
        }

        const fechaCompra = new Date(formCompra.fecha_compra);
        const fechaIngreso = new Date(formCompra.fecha_ingreso);

        if (fechaIngreso < fechaCompra) {
            setErroresCompra(prev => ({
                ...prev,
                fecha_ingreso: 'La fecha de ingreso no puede ser menor que la fecha de compra',
            }));

            Swal.fire({
                icon: 'warning',
                title: 'Fechas inválidas',
                text: 'La fecha de ingreso no puede ser anterior a la fecha de compra.',
                customClass: { popup: 'swal-rosado' }
            });
            return;
        }

        if (insumosEnModal.length === 0) {
            setErrorInsumosCompra('Agrega al menos un insumo');

            Swal.fire({
                icon: 'warning',
                title: 'Insumos requeridos',
                text: 'Debes agregar al menos un insumo para crear la compra.',
                customClass: { popup: 'swal-rosado' }
            });
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Vas a crear una compra con los datos e insumos ingresados.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, crear compra',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            customClass: { popup: 'swal-rosado' }
        });

        if (!confirmacion.isConfirmed) return;

        // Crear compra
        const compraPayload = {
            fechaIngreso: formCompra.fecha_ingreso,
            fechaCompra: formCompra.fecha_compra,
            proveedor_id: formCompra.proveedor,
            total: total
        };

        const response = await crear_compra(compraPayload);

        if (response.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al crear la compra: ${response.message}`,
                customClass: { popup: 'swal-rosado' }
            });
            return;
        }

        const compraId = response.id;
        const insumosPayload = insumosEnModal.map(i => ({
            insumo_id: i.id,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            subtotal: i.precioUnitario * i.cantidad,
            compra_id: compraId
        }));

        try {
            const insumosRes = await fetch("https://angelsuarez.pythonanywhere.com/api/compras/compra-insumos/batch/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(insumosPayload),
            });

            if (!insumosRes.ok) throw new Error("No se pudieron guardar los insumos");

            Swal.fire({
                icon: 'success',
                title: 'Compra creada',
                text: 'Compra e insumos creados exitosamente.',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });

            await fetchCompras();
            closeCrearModal();
        } catch (err) {
            console.error("Error al guardar insumos:", err);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La compra fue creada, pero ocurrió un error guardando los insumos.',
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showModal) {
            const cargarInsumos = async () => {
                const datos = await obtenerInsumos();
                setInsumosDisponibles(datos);
            };
            cargarInsumos();
        }
    }, [showModal]);

    useEffect(() => {
        const fetchProveedores = async () => {
            const data = await obtenerProveedores();
            setProveedores(data);
        };

        fetchProveedores();
    }, []);

    const [pasoActual, setPasoActual] = useState(1);
    const [inputInsumoNombre, setInputInsumoNombre] = useState("");
    const [sugerenciasInsumo, setSugerenciasInsumo] = useState([]);
    const [errorInsumoSeleccionado, setErrorInsumoSeleccionado] = useState("");
    const [modoEdicionIndex, setModoEdicionIndex] = useState(null);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const minCompraDate = '2025-01-01';

    const [calificaciones, setCalificaciones] = useState([])
    const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
    const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tabActiva, setTabActiva] = useState("notificaciones")

    // Función para cargar calificaciones vistas desde localStorage
    const cargarCalificacionesVistas = () => {
        try {
            const vistas = localStorage.getItem("calificacionesVistas")
            if (vistas) {
                return new Set(JSON.parse(vistas))
            }
        } catch (error) {
            console.error("Error al cargar calificaciones vistas:", error)
        }
        return new Set()
    }

    const cargarCalificaciones = async () => {
        setLoadingCalificaciones(true)
        try {
            const data = await listar_calificaciones()
            setCalificaciones(data)
        } catch (error) {
            console.error("Error al cargar calificaciones:", error)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar las calificaciones.",
                customClass: { popup: "swal-rosado" },
            })
        } finally {
            setLoadingCalificaciones(false)
        }
    }

    const guardarCalificacionesVistas = (vistas) => {
        try {
            localStorage.setItem("calificacionesVistas", JSON.stringify([...vistas]))
        } catch (error) {
            console.error("Error al guardar calificaciones vistas:", error)
        }
    }

    const marcarCalificacionesComoVistas = (idsCalificaciones) => {
        const nuevasVistas = new Set([...calificacionesVistas, ...idsCalificaciones])
        setCalificacionesVistas(nuevasVistas)
        guardarCalificacionesVistas(nuevasVistas)
    }

    const openModal = (tab = "calificaciones") => {
        setTabActiva(tab)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        if (tabActiva === "calificaciones") {
            setNotificaciones((prev) => prev.map((n) => ({ ...n, visto: true })))
        } else if (tabActiva === "calificaciones") {
            const idsCalificaciones = calificaciones.map((c) => c.id)
            marcarCalificacionesComoVistas(idsCalificaciones)
        }
    }

    const calificacionesNoVistas = calificaciones.filter((c) => !calificacionesVistas.has(c.id)).length

    useEffect(() => {
        const vistasGuardadas = cargarCalificacionesVistas()
        setCalificacionesVistas(vistasGuardadas)


        cargarCalificaciones()
    }, [])

    useEffect(() => {
        if (calificaciones.length > 0) {
            const vistasActuales = cargarCalificacionesVistas()
            setCalificacionesVistas(vistasActuales)
        }
    }, [calificaciones])

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getEstrellas = (puntuacion) => {
        const estrellas = []
        const maxEstrellas = 5

        const estrellasLlenas = puntuacion === 1 ? 5 : puntuacion === 2 ? 4 : puntuacion === 3 ? 2 : 1

        for (let i = 0; i < maxEstrellas; i++) {
            estrellas.push(
                <Star
                    key={i}
                    size={16}
                    style={{
                        color: i < estrellasLlenas ? "#fbbf24" : "#d1d5db",
                        fill: i < estrellasLlenas ? "#fbbf24" : "transparent",
                    }}
                />,
            )
        }
        return estrellas
    }

    const getPuntuacionTexto = (puntuacion) => {
        const opciones = {
            1: "Muy Bien",
            2: "Bien",
            3: "Mal",
            4: "Muy Mal",
        }
        return opciones[puntuacion] || "Sin calificar"
    }


    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de compras</h1>
                <div className="iconos-perfil">
                    <div className="bell-container" onClick={() => openModal("calificaciones")}>
                        <span title="Ver calificaciones">
                            <Star className="icon" />
                        </span>
                        {calificacionesNoVistas > 0 && (
                            <span className="notification-badge">{calificacionesNoVistas > 99 ? "99+" : calificacionesNoVistas}</span>
                        )}
                    </div>
                    <Link to="/administrador/dashboard/perfil">
                        <span title="Tu perfil">
                            <User className="icon" />
                        </span>
                    </Link>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

                <button className="crear-btn mb-4" onClick={() => setIsCrearModalOpen(true)}>
                    Crear compra
                </button>

                <input
                    type="text"
                    placeholder="Buscar compra..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>

            <div className="overflow-hidden">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Proveedor</th>
                            <th>Fecha Compra</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comprasActuales.length > 0 ? (
                            comprasActuales.map((compra) => {
                                const esEditable = compra.estado_nombre === "Pendiente";
                                return (
                                    <tr key={compra.id}>
                                        <td>{obtenerNombreProveedor(proveedores.find(p => p.id === compra.proveedor_id))}</td>
                                        <td>{compra.fechaCompra}</td>
                                        <td>$ {parseFloat(compra.total).toLocaleString()}</td>
                                        <td>
                                            <span
                                                className={`estado-texto ${compra.estado_nombre === 'Pendiente'
                                                    ? 'estado-pendiente'
                                                    : compra.estado_nombre === 'Completada'
                                                        ? 'estado-completada'
                                                        : compra.estado_nombre === 'Cancelada'
                                                            ? 'estado-cancelada'
                                                            : ''
                                                    }`}
                                            >
                                                {compra.estado_nombre}
                                            </span>
                                        </td>
                                        <td className="text-center space-x-2">
                                            <button
                                                onClick={() => openVerModal(compra)}
                                                className="acciones-btn editar-btn"
                                                title="Ver factura de la compra"
                                            >
                                                <AiOutlineEye size={18} className="text-pink-500" />
                                            </button>
                                            {compra.estado_nombre !== 'Completada' && compra.estado_nombre !== 'Cancelada' && (
                                                <button
                                                    onClick={() => esEditable && completarCompra(compra)}
                                                    disabled={!esEditable}
                                                    className={`acciones-btn ver-btn ${!esEditable && 'opacity-50'}`}
                                                    title="Completar compra"
                                                >
                                                    <AiOutlineCheck size={18} className="text-green-500" />
                                                </button>
                                            )}
                                            {compra.estado_nombre !== 'Completada' && compra.estado_nombre !== 'Cancelada' && (
                                                <button
                                                    onClick={() => esEditable && anularCompra(compra)}
                                                    disabled={!esEditable}
                                                    className={`acciones-btn eliminar-btn ${!esEditable && 'opacity-50'}`}
                                                    title="Cancelar compra"
                                                >
                                                    <MdBlock size={18} className="text-red-500" />
                                                </button>
                                            )}

                                            <button
                                                className="acciones-btn ver-btn"
                                                title="Imprimir un pdf de la compra"
                                                onClick={() => {
                                                    openVerModal(compra);
                                                    setTimeout(() => {
                                                        exportarPDF(compra.id);
                                                    }, 500);
                                                }}
                                            >
                                                <AiFillFilePdf size={18} className="text-red-500" />
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No se encontraron compras</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="paginacion-container">
                <div className={`flecha ${paginaActual === 1 ? 'flecha-disabled' : ''}`} onClick={() => cambiarPagina(paginaActual - 1)}>&#8592;</div>
                <span className="texto-paginacion">Página {paginaActual} de {totalPaginas}</span>
                <div className={`flecha ${paginaActual === totalPaginas ? 'flecha-disabled' : ''}`} onClick={() => cambiarPagina(paginaActual + 1)}>&#8594;</div>
            </div>

            {isCrearModalOpen && (
                <div className="overlay-popup" onClick={closeCrearModal}>
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup3">
                            <h2 className="titulo-usuario">
                                {pasoActual === 1 ? "Crear compra" : "Agregar insumos"}
                            </h2>
                            {pasoActual === 1 && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();

                                        const errores = {};

                                        if (!formCompra.proveedor) {
                                            errores.proveedor = "Selecciona un proveedor.";
                                        }
                                        if (!formCompra.fecha_ingreso) {
                                            errores.fecha_ingreso = "La fecha de ingreso es obligatoria.";
                                        }
                                        if (!formCompra.fecha_compra) {
                                            errores.fecha_compra = "La fecha de compra es obligatoria.";
                                        }

                                        if (Object.keys(errores).length > 0) {
                                            setErroresCompra(errores);

                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Campos incompletos',
                                                text: 'Por favor completa todos los campos obligatorios antes de continuar.',
                                                confirmButtonColor: '#d33',
                                                confirmButtonText: 'Entendido',
                                            });

                                            return;
                                        }

                                        const fechaCompra = new Date(formCompra.fecha_compra);
                                        const fechaIngreso = new Date(formCompra.fecha_ingreso);

                                        if (fechaIngreso < fechaCompra) {
                                            setErroresCompra(prev => ({
                                                ...prev,
                                                fecha_ingreso: 'La fecha de ingreso no puede ser menor que la fecha de compra',
                                            }));

                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Fechas inválidas',
                                                text: 'La fecha de ingreso no puede ser anterior a la fecha de compra.',
                                                customClass: { popup: 'swal-rosado' },
                                            });
                                            return;
                                        }

                                        setErroresCompra({});
                                        setPasoActual(2);
                                    }}
                                    className="space-y-3"
                                >
                                    <div className="fila-formulario">
                                        <div className="w-full campo relative">
                                            <label className="subtitulo-editar-todos">Seleccionar proveedor:</label>
                                            <select
                                                name="proveedor"
                                                className="input-select w-full"
                                                value={formCompra.proveedor}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            >
                                                <option value="">Proveedor *</option>

                                                {proveedores
                                                    .filter((p) => p.estado === "Activo")
                                                    .map((p) => {
                                                        const nombre =
                                                            p.tipo_persona === "NATURAL"
                                                                ? `${p.nombre_representante} ${p.apellido_representante}`
                                                                : p.nombre_empresa;

                                                        return (
                                                            <option key={p.id} value={p.id}>
                                                                {nombre}
                                                            </option>
                                                        );
                                                    })}
                                            </select>

                                            {erroresCompra.proveedor && (
                                                <p className="error-texto text-red-600 text-left mt-1">{erroresCompra.proveedor}</p>
                                            )}
                                        </div>

                                        <div className="w-full campo relative">
                                            <label className="subtitulo-editar-todos">Fecha de compra:</label>
                                            {showCompraDateInput || formCompra.fecha_compra ? (
                                                <input
                                                    type="date"
                                                    name="fecha_compra"
                                                    className="input-fecha-activo-compra w-full"
                                                    value={formCompra.fecha_compra}
                                                    max={todayStr}
                                                    min={minCompraDate}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        if (erroresCompra.fecha_compra) {
                                                            validarCampo("fecha_compra", e.target.value);
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!formCompra.fecha_compra) setShowCompraDateInput(false);
                                                        validarCampo("fecha_compra", formCompra.fecha_compra);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => setShowCompraDateInput(true)}
                                                    className="input-fecha-placeholder-compra w-full"
                                                >
                                                    Fecha de compra <span className="text-red-600"> *</span>
                                                </div>
                                            )}
                                            {erroresCompra.fecha_compra && (
                                                <p className="error-texto text-red-600 text-left mt-1">{erroresCompra.fecha_compra}</p>
                                            )}
                                        </div>

                                        <div className="w-full campo relative">
                                            <label className="subtitulo-editar-todos">Fecha de ingreso:</label>
                                            {showIngresoDateInput || formCompra.fecha_ingreso ? (
                                                <input
                                                    type="date"
                                                    name="fecha_ingreso"
                                                    className="input-fecha-activo-compra w-full"
                                                    value={formCompra.fecha_ingreso}
                                                    min={formCompra.fecha_compra || "2025-01-01"}
                                                    max={`${new Date().getFullYear()}-12-31`}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        if (erroresCompra.fecha_ingreso) {
                                                            validarCampo("fecha_ingreso", e.target.value);
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!formCompra.fecha_ingreso) setShowIngresoDateInput(false);
                                                        validarCampo("fecha_ingreso", formCompra.fecha_ingreso);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => setShowIngresoDateInput(true)}
                                                    className="input-fecha-placeholder-compra w-full"
                                                >
                                                    Fecha de ingreso <span className="text-red-600"> *</span>
                                                </div>
                                            )}
                                            {erroresCompra.fecha_ingreso && (
                                                <p className="error-texto text-red-600 text-left mt-1">{erroresCompra.fecha_ingreso}</p>
                                            )}
                                        </div>

                                    </div>

                                    <div className="button-container">
                                        <button type="button" className="btn-cancelar" onClick={closeCrearModal}>Cancelar</button>
                                        <button type="submit" className="btn-crear">Continuar</button>
                                    </div>
                                </form>
                            )}

                            {/* PASO 2: AGREGAR INSUMOS DIRECTAMENTE */}
                            {pasoActual === 2 && (
                                <>
                                    <div className="modal-form-row">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Insumo:</label>
                                            <input
                                                type="text"
                                                className="input-texto modal-input"
                                                placeholder="Insumo *"
                                                value={inputInsumoNombre}
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    setInputInsumoNombre(valor);
                                                    setErrorInsumoSeleccionado("");
                                                    const filtrados = insumos.filter((ins) =>
                                                        ins.nombre.toLowerCase().includes(valor.toLowerCase())
                                                    );
                                                    setSugerenciasInsumo(filtrados);
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => setSugerenciasInsumo([]), 150); // permitir clic
                                                }}
                                                onFocus={() => {
                                                    if (inputInsumoNombre) {
                                                        const filtrados = insumos.filter((ins) =>
                                                            ins.nombre.toLowerCase().includes(inputInsumoNombre.toLowerCase())
                                                        );
                                                        setSugerenciasInsumo(filtrados);
                                                    }
                                                }}
                                            />

                                            {sugerenciasInsumo.length > 0 && (
                                                <ul className="resultado-lista">
                                                    {sugerenciasInsumo.map((ins, index) => (
                                                        <li
                                                            key={index}
                                                            className="resultado-item cursor-pointer"
                                                            onClick={() => {
                                                                setInsumoSeleccionado(ins);
                                                                setInputInsumoNombre(ins.nombre);
                                                                setPrecioUnitario(ins.precio);
                                                                setSugerenciasInsumo([]);
                                                            }}
                                                        >
                                                            {ins.nombre} - stock: {ins.stock}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {errorInsumoSeleccionado && (
                                                <p className="error-texto text-red-600 text-left mt-1">{errorInsumoSeleccionado}</p>
                                            )}
                                        </div>

                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Precio unitario:</label>
                                            <input
                                                type="number"
                                                className={`input-texto modal-input ${errorPrecio ? "input-error" : ""}`}
                                                value={precioUnitario}
                                                min="0"
                                                onChange={(e) => {
                                                    const valor = e.target.value;
                                                    setPrecioUnitario(valor === '' ? '' : parseFloat(valor));
                                                    if (errorPrecio) setErrorPrecio("");
                                                }}
                                                placeholder="Precio Unitario *"
                                            />
                                            {errorPrecio && (
                                                <p className="error-texto text-red-600 text-left mt-1">{errorPrecio}</p>
                                            )}
                                        </div>

                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Cantidad:</label>
                                            <input
                                                type="number"
                                                className={`input-texto modal-input ${errorCantidad ? "input-error" : ""}`}
                                                value={cantidad}
                                                min="0"
                                                onChange={(e) => {
                                                    setCantidad(e.target.value);
                                                    if (errorCantidad) validarCantidad();
                                                }}
                                                onBlur={validarCantidad}
                                                placeholder="Cantidad *"
                                            />
                                            {errorCantidad && (
                                                <p className="error-texto text-red-600 text-left mt-1">{errorCantidad}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="modal-botones">
                                        <button
                                            onClick={() => {
                                                if (!insumoSeleccionado || !precioUnitario || !cantidad) {
                                                    validarCantidad();
                                                    if (!insumoSeleccionado) setErrorInsumoSeleccionado("Selecciona un insumo válido.");
                                                    if (!precioUnitario) setErrorPrecio("Debes ingresar un precio.");
                                                    return;
                                                }

                                                const nuevoInsumo = {
                                                    id: insumoSeleccionado.id,
                                                    nombre: insumoSeleccionado.nombre,
                                                    precioUnitario,
                                                    cantidad,
                                                };

                                                if (modoEdicionIndex !== null) {
                                                    const copia = [...insumosEnModal];
                                                    copia[modoEdicionIndex] = nuevoInsumo;
                                                    setInsumosEnModal(copia);
                                                    setModoEdicionIndex(null);
                                                } else {
                                                    setInsumosEnModal([...insumosEnModal, nuevoInsumo]);
                                                }

                                                resetCampos();
                                            }}
                                            className="btn-agregar"
                                        >
                                            {modoEdicionIndex !== null ? "Guardar cambios" : "Agregar insumo"}
                                        </button>
                                    </div>

                                    <div className="insumos-agregados-modal">
                                        <h4>Insumos agregados:</h4>
                                        {insumosEnModal.length === 0 ? (
                                            <p>No has agregado insumos aún.</p>
                                        ) : (
                                            <div className="grid-insumos-modal">
                                                {insumosEnModal.map((ins, index) => (
                                                    <div key={index} className="insumo-item-modal">
                                                        {ins.nombre} - ${ins.precioUnitario} x {ins.cantidad}
                                                        <div className="insumo-item-actions space-x-2">
                                                            <button
                                                                className="btn-editar-insumo-agregar"
                                                                onClick={() => {
                                                                    setInputInsumoNombre(ins.nombre);
                                                                    setInsumoSeleccionado(ins);
                                                                    setPrecioUnitario(ins.precioUnitario);
                                                                    setCantidad(ins.cantidad);
                                                                    setModoEdicionIndex(index);
                                                                }}
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                className="btn-eliminar-insumo-agregar"
                                                                onClick={() => {
                                                                    const nuevos = insumosEnModal.filter((_, i) => i !== index);
                                                                    setInsumosEnModal(nuevos);
                                                                    if (modoEdicionIndex === index) {
                                                                        setModoEdicionIndex(null);
                                                                        resetCampos();
                                                                    }
                                                                }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="fila-formulario">
                                        <input
                                            type="text"
                                            value={`Total: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total)}`}
                                            className="input-texto"
                                            readOnly
                                        />
                                    </div>

                                    <div className="button-container">
                                        <button type="button" className="btn-cancelar" onClick={() => setPasoActual(1)}>
                                            Volver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCrear}
                                            className="btn-crear"
                                            disabled={loading}
                                        >
                                            {loading ? "Creando compra..." : "Crear compra"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isVerModalOpen && compraSeleccionada && (
                <div className="overlay-popup" onClick={closeVerModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div id="factura-modal" className="contenido-popup-2">
                            <h2 className="titulo-usuario">Factura {compraSeleccionada.estado_nombre}</h2>
                            <img src={logo} alt="" className="logo-ver-compra" />
                            <hr className="linea" />
                            <div>
                                <h5 className="informacion-proveedor">Compra #{compraSeleccionada.id}</h5>
                                <div className="fechas">
                                    <p>Fecha de compra: {compraSeleccionada.fechaCompra}</p>
                                    <p>Fecha de ingreso: {compraSeleccionada.fechaIngreso}</p>
                                </div>

                                {(() => {
                                    const proveedor = buscarProveedorPorId(compraSeleccionada.proveedor_id);
                                    return (
                                        <>
                                            <div className="informacion-proveedor">
                                                <p><strong>Información Proveedor</strong></p>
                                                <p>{obtenerNombreProveedor(proveedor)}</p>
                                                <p>{proveedor?.telefono}</p>
                                                <p>{proveedor?.email}</p>
                                                <p>{proveedor?.direccion}, {proveedor?.ciudad}</p>
                                            </div>
                                            <div className="informacion-proveedor" style={{ marginTop: "10px" }}>
                                                <p><strong>Estado de la compra</strong></p>
                                                <p>{compraSeleccionada.estado_nombre}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <hr className="linea" />
                            <div className="insumos-factura">
                                <h4 className="facturados">Insumos Facturados</h4>

                                <div className="header-factura">
                                    <p><strong>Insumo</strong></p>
                                    <p>Precio</p>
                                    <p>Cantidad</p>
                                    <p>Subtotal</p>
                                    <p>IVA</p>
                                    <p>Total</p>
                                </div>

                                {compraInsumos.map((item, index) => {
                                    const insumo = buscarInsumoPorId(item.insumo_id);
                                    const nombreInsumo = insumo ? insumo.nombre : "Insumo no encontrado";
                                    const subtotal = parseFloat(item.subtotal);
                                    const iva = parseFloat(subtotal * 0.19).toFixed(2);
                                    const total = parseFloat(subtotal + parseFloat(iva)).toFixed(2);

                                    return (
                                        <div className="fila-factura" key={index}>
                                            <p className="col-insumo">{nombreInsumo}</p>
                                            <p className="dinero">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precioUnitario)}
                                            </p>
                                            <p className="dinero">{item.cantidad}</p>
                                            <p className="dinero">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotal)}
                                            </p>
                                            <p className="dinero">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(iva)}
                                            </p>
                                            <p className="dinero">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="valores-totales">
                                <p><strong>Subtotal de la compra:</strong> <span>$ {compraInsumos.reduce((acc, ins) => acc + parseFloat(ins.subtotal), 0).toLocaleString()}</span></p>
                                <p><strong>IVA total de la compra:</strong> <span>$ {(compraInsumos.reduce((acc, ins) => acc + parseFloat(ins.subtotal), 0) * 0.19).toLocaleString()}</span></p>
                                <p><strong>Total a pagar:</strong> <span className="total">$ {(compraInsumos.reduce((acc, ins) => acc + parseFloat(ins.subtotal), 0) * 1.19).toLocaleString()}</span></p>
                            </div>
                            <div className="footer-popup">
                                <p>"Este comprobante corresponde a la compra realizada a proveedor y es de uso exclusivo para control interno"</p>
                                <p>CandyNails Medellín © 2025</p>
                            </div>
                            <div className="button-container">
                                <button className="btn-cancelar ocultar-al-exportar" onClick={closeVerModal}>Volver</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="overlay-popup-notifications" onClick={closeModal}>
                    <div className="ventana-popup-notifications" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup-notifications">
                            <div className="notifications-header">
                                <h1 className="notifications-title">Centro de calificaciones</h1>
                                <button onClick={closeModal} className="close-button">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="tabs-container">
                                <button
                                    className={`tab-button ${tabActiva === "calificaciones" ? "tab-active" : "tab-inactive"}`}
                                    onClick={() => setTabActiva("calificaciones")}
                                >
                                    <div className="tab-content">
                                        <Star className="w-4 h-4" />
                                        Calificaciones
                                        {calificacionesNoVistas > 0 && <span className="tab-badge">{calificacionesNoVistas}</span>}
                                    </div>
                                </button>
                            </div>

                            {/* Contenido de las pestañas mejorado */}
                            <div className="tab-content-container">
                                {tabActiva === "calificaciones" && (
                                    <div className="tab-panel">
                                        <h2 className="section-title">Calificaciones Recibidas</h2>
                                        {loadingCalificaciones ? (
                                            <div className="loading-state">
                                                <div className="loading-spinner"></div>
                                                <p>Cargando calificaciones...</p>
                                            </div>
                                        ) : calificaciones.length === 0 ? (
                                            <div className="empty-state">
                                                <Star className="empty-icon" />
                                                <p>No hay calificaciones disponibles.</p>
                                            </div>
                                        ) : (
                                            <ul className="ratings-list">
                                                {calificaciones
                                                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                                                    .map((c) => (
                                                        <li
                                                            key={c.id}
                                                            className={`rating-item ${!calificacionesVistas.has(c.id) ? "rating-unread" : "rating-read"}`}
                                                        >
                                                            <div className="rating-header">
                                                                <div className="rating-stars">
                                                                    <div className="stars-container">{getEstrellas(c.puntuacion)}</div>
                                                                    <span className="rating-text">{getPuntuacionTexto(c.puntuacion)}</span>
                                                                </div>
                                                                {!calificacionesVistas.has(c.id) && <span className="rating-dot"></span>}
                                                            </div>
                                                            {c.comentario && <p className="rating-comment">"{c.comentario}"</p>}
                                                            <p className="rating-date">{formatearFecha(c.fecha_creacion)}</p>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button className="close-modal-button" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCompras;