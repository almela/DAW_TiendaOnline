<?php

class Pedido
{
    # Manejamos el carrito con sessiones
    # si es el primer artículo y/o la variable carrito no estuviera creada se crea primero
    # se añade primero como 0 unidades, y luego comprobamos si existe y se le suma
    # la cantidad, esto hace por ejemplo que si ya teníamos una nos la sume, y no la vuelva 
    # a añadir. Para ello definimos para cada artículo una key compuesta por el id del producto y la talla
    public function agregarCarrito($arrayRequest)
    {
        $pro_id = $arrayRequest["pro_id"];
        $pro_nombre = $arrayRequest["pro_nombre"];
        $pro_precio = $arrayRequest["pro_precio"];
        $talla = $arrayRequest["talla"];
        $cantidad = $arrayRequest["cantidad"];

        if (!isset($_SESSION['carrito'])) {
            $_SESSION['carrito'] = [];
        }

        $key = $pro_id . "_" . $talla;

        if (!isset($_SESSION['carrito'][$key])) {
            $_SESSION['carrito'][$key] = [
                'pro_id' => $pro_id,
                'pro_nombre' => $pro_nombre,
                'pro_precio' => $pro_precio,
                'talla' => $talla,
                'cantidad' => 0
            ];
        }

        $_SESSION['carrito'][$key]['cantidad'] += $cantidad;

        // Con array_sum sumamos el número de artículos que hay en el carrito
        $total = array_sum(array_column($_SESSION['carrito'], 'cantidad'));

        return [
            "correcto" => true,
            "total_articulos" => $total,
            "contenido_cesta" => $_SESSION['carrito']
        ];
    }

    # Función para eliminar una zapatilla del carrito, eliminamos la entrada con unset
    public function eliminarCarrito($arrayRequest)
    {
        $key = $arrayRequest["key"];

        if ($key && isset($_SESSION['carrito'][$key])) {
            unset($_SESSION['carrito'][$key]);
        }

        return [
            "correcto" => true,
        ];
    }

    # Función para obtener el carrito para luego pintarlo
    public function getCarrito()
    {

        if (!isset($_SESSION['carrito'])) {
            $_SESSION['carrito'] = [];

        }
        $total = array_sum(array_column($_SESSION['carrito'], 'cantidad'));

        return [
            "correcto" => true,
            "total_articulos" => $total,
            "contenido_cesta" => $_SESSION['carrito']
        ];
    }

    # Función para generar un nuevo pedido, primero inserta la cabecera del pedido
    # y después inserta linea a linea el contenido del pedido
    public function hazPedido()
    {
        $usuId = $_SESSION["usu_id"];
        $carrito = $_SESSION["carrito"];

        $db = new ConexionBD();
        try {
            $stmt = $db->pdo->prepare(Sql::nuevoPedido());
            $stmt->bindParam(':usu_id', $usuId);
            $stmt->execute();
            $pedId = $db->pdo->lastInsertId();

            foreach ($carrito as $zapatilla) {
                $stmt = $db->pdo->prepare(Sql::nuevaLineaPedido());
                $stmt->bindParam(':ped_id', $pedId);
                $stmt->bindParam(':pro_id', $zapatilla["pro_id"]);
                $stmt->bindParam(':unidades', $zapatilla["cantidad"]);
                $stmt->bindParam(':talla', $zapatilla["talla"]);
                $stmt->bindParam(':precio', $zapatilla["pro_precio"]);
                $stmt->execute();
            }
            $_SESSION['carrito'] = [];

            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al generar el pedido: " . $e
            ];
        }
    }

    # Función que nos muestra un histórico de pedidos dadas dos fechas
    # desde y hasta
    public function consultar($arrayRequest)
    {
        $desde = $arrayRequest["desde"]. " 00:00:00";
        $hasta = $arrayRequest["hasta"]. " 23:59:59";
        $usuId = $_SESSION['usu_id'];

        $db = new ConexionBD();
        try {
            $arrPedidos = [];
            $stmt = $db->pdo->prepare(Sql::consultaPedidos());
            $stmt->bindParam(':usu_id', $usuId);
            $stmt->bindParam(':desde', $desde);
            $stmt->bindParam(':hasta', $hasta);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["lineas_pedido"] = $this->getLineasPedido($row["ped_id"], $db);
                array_push($arrPedidos, $row);
            }
            return [
                "correcto" => true,
                "pedidos" => $arrPedidos
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al consultar los pedidos: " . $e
            ];
        }
    }

    # Función privada auxiliar para obtener las lineas del pedido
    private function getLineasPedido($pedId, $db)
    {
        $arrLineas = [];
        $stmt = $db->pdo->prepare(Sql::getLineasPedido());
        $stmt->bindParam(':ped_id', $pedId);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($arrLineas, $row);
        }
        return $arrLineas;
    }
}