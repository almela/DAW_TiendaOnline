<?php

include 'db/Conexionbd.php';
include 'db/sql/Sql.php';

include 'controller/Auth.php';
include 'controller/Usuario.php';
include 'controller/Producto.php';
include 'controller/Pedido.php';
session_start();

class Api
{

    public function procesaRuta()
    {

        $ruta = explode("/", $_GET['ruta']);
        $method = $_SERVER['REQUEST_METHOD'];
        $arrayRequest = json_decode(file_get_contents("php://input"), true);
        $identificado = (isset($_SESSION['usu_id'])) ? true : false;
        if ($ruta[0] == 'usuario-logado') {
            $identificado = (isset($_SESSION['usu_id'])) ? true : false;
            if ($identificado) {
                # Retornamos los datos del usuario que están en la sesión
                $datos = [
                    "usu_nombre" => $_SESSION['usu_nombre'],
                    "usu_rol" => $_SESSION['usu_rol'],
                    "usu_email" => $_SESSION['usu_email']
                ];
            } else {
                $datos = null;
            }
            $this->respuesta(['identificado' => $identificado, 'datos' => $datos]);
        } else if ($ruta[0] == "novedades") {
            $productos = new Producto();
            $datos = $productos->getNovedades();
            $this->respuesta(['identificado' => $identificado, 'datos' => $datos]);
        } else if ($ruta[0] == "productos") {
            # Aquí no miramos si es administrador o no, para sacar los productos lo reutilizamos 
            $productos = new Producto();
            $datos = $productos->getProductos();
            $this->respuesta(['identificado' => true, 'datos' => $datos]);
        } else if ($ruta[0] == "filtros") {
            # Aquí no miramos si es administrador o no, para sacar los productos lo reutilizamos 
            $productos = new Producto();
            $datos = $productos->getContenidoFiltros();
            $this->respuesta(['identificado' => true, 'datos' => $datos]);
        } else {
            if ($identificado) {
                # Usuario autenticado
                switch ($ruta[0]) {
                    # USUARIOS
                    case 'cerrar-sesion':
                        session_destroy();
                        $this->respuesta(['identificado' => false]);
                        break;
                    case 'actualizar-usuario':
                        $usuarios = new Usuario();
                        $datos = $usuarios->actualizarDatosUsuario($arrayRequest);
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'cambiar-password':
                        $usuarios = new Usuario();
                        $datos = $usuarios->cambiarPassword($arrayRequest);
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'datos-usuario':
                        $usuarios = new Usuario();
                        $datos = $usuarios->getDatosUsuario();
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    # ADMINISTRADOR
                    case 'usuarios':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $usuarios = new Usuario();
                            $datos = $usuarios->getUsuarios();
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'nuevo-usuario':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $auth = new Auth();
                            $datos = $auth->registro($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'editar-usuario':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $usuarios = new Usuario();
                            $datos = $usuarios->updateUsuario($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'borrar-usuario':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $usuarios = new Usuario();
                            $datos = $usuarios->deleteUsuario($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    # PRODUCTOS
                    case 'nuevo-producto':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->crearProducto();
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'editar-producto':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->editarProducto();
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'nueva-talla':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->crearTalla($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'editar-talla':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->editarTalla($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'borrar-talla':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->eliminarTalla($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'borrar-producto':
                        if ($_SESSION["usu_rol"] == "ADMINISTRADOR") {
                            $productos = new Producto();
                            $datos = $productos->deleteProducto($arrayRequest);
                            $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        } else {
                            $this->respuesta(['identificado' => true, 'error' => 'No tienes permisos de administrador']);
                        }
                        break;
                    case 'agregar-carrito':
                        $pedido = new Pedido();
                        $datos = $pedido->agregarCarrito($arrayRequest);
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'eliminar-carrito':
                        $pedido = new Pedido();
                        $datos = $pedido->eliminarCarrito($arrayRequest);
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'carrito':
                        $pedido = new Pedido();
                        $datos = $pedido->getCarrito();
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'pedido':
                        $pedido = new Pedido();
                        $datos = $pedido->hazPedido();
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;
                    case 'consulta-pedidos':
                        $pedido = new Pedido();
                        $datos = $pedido->consultar($arrayRequest);
                        $this->respuesta(['identificado' => true, 'datos' => $datos]);
                        break;


                }
            } else {
                # Usuario no autenticado
                # Sólo permitimos la ruta de login y de registro
                switch ($ruta[0]) {
                    case 'login':
                        if ($method == "POST") {
                            $auth = new Auth();
                            $login = $auth->hazLogin($arrayRequest);
                            $this->respuesta($login);
                        }
                        break;
                    case 'registro':
                        if ($method == "POST") {
                            $auth = new Auth();
                            $registro = $auth->registro($arrayRequest);
                            $this->respuesta([
                                "identificado" => false,
                                "datos" => $registro
                            ]);
                        }
                        break;
                    default:
                        $this->respuesta(['identificado' => false]);
                        break;
                }
            }
        }

    }

    private function respuesta($datos)
    {
        header("Content-Type: application/json");
        print json_encode($datos, JSON_PRETTY_PRINT);
    }
}

$api = new Api();
$api->procesaRuta();

