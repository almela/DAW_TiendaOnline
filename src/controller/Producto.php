<?php

class Producto
{

    public function crearProducto()
    {
        $nombre = $_POST['pro_nombre'];
        $marca = $_POST['pro_marca'];
        $tipo = $_POST['pro_tipo'];
        $color = $_POST['pro_color'];
        $precio = $_POST['pro_precio'];

        $db = new ConexionBD();

        try {
            $imgName = null;
            if (!empty($_FILES['pro_imagen']['tmp_name'])) {
                $imgName = uniqid() . "_" . $_FILES['pro_imagen']['name'];
                move_uploaded_file(
                    $_FILES['pro_imagen']['tmp_name'],
                    "uploads/$imgName"
                );
            }
            $stmt = $db->pdo->prepare(query: Sql::nuevoProducto());
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':color', $color);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':imagen', $imgName);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al crear el producto: " . $e
            ];
        }

    }

    public function crearTalla($arrayRequest)
    {
        $talla = $arrayRequest['tall_talla'];
        $estoc = $arrayRequest['tall_estoc'];
        $pro_id = $arrayRequest['tall_pro_id'];

        $db = new ConexionBD();

        try {

            $stmt = $db->pdo->prepare(query: Sql::nuevaTalla());
            $stmt->bindParam(':pro_id', $pro_id);
            $stmt->bindParam(':talla', $talla);
            $stmt->bindParam(':estoc', $estoc);
            $stmt->execute();

            $tallId = $db->pdo->lastInsertId();

            return [
                "correcto" => true,
                "datos" => [
                    "tall_id" => $tallId,
                    "tall_pro_id" => $pro_id,
                    "tall_talla" => $talla,
                    "tall_estoc" => $estoc
                ]
            ];
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al crear la talla: " . $e
            ];
        }
    }

    public function editarTalla($arrayRequest)
    {
        $talla = $arrayRequest['tall_talla'];
        $estoc = $arrayRequest['tall_estoc'];
        $tall_id = $arrayRequest['tall_id'];

        $db = new ConexionBD();

        try {

            $stmt = $db->pdo->prepare(query: Sql::updateTalla());
            $stmt->bindParam(':talla', $talla);
            $stmt->bindParam(':estoc', $estoc);
            $stmt->bindParam(':tall_id', $tall_id);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al editar la talla: " . $e
            ];
        }
    }

    public function eliminarTalla($arrayRequest)
    {
        $tall_id = $arrayRequest['tall_id'];

        $db = new ConexionBD();

        try {

            $stmt = $db->pdo->prepare(query: Sql::deleteTalla());
            $stmt->bindParam(':tall_id', $tall_id);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al borrar la talla: " . $e
            ];
        }
    }

    public function editarProducto()
    {
        $nombre = $_POST['pro_nombre'];
        $marca = $_POST['pro_marca'];
        $tipo = $_POST['pro_tipo'];
        $color = $_POST['pro_color'];
        $precio = $_POST['pro_precio'];
        $proId = $_POST['pro_id'];
        $imagenAnterior = $_POST['pro_imagen_anterior'];

        $db = new ConexionBD();

        try {
            $imgName = null;
            if (!empty($_FILES['pro_imagen']['tmp_name'])) {
                $imgName = uniqid() . "_" . $_FILES['pro_imagen']['name'];
                move_uploaded_file(
                    $_FILES['pro_imagen']['tmp_name'],
                    "uploads/$imgName"
                );
            }
            $imagen = (is_null($imgName)) ? $imagenAnterior : $imgName;
            $stmt = $db->pdo->prepare(query: Sql::updateProducto());
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':color', $color);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':imagen', $imagen);
            $stmt->bindParam(':pro_id', $proId);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al actualizar el producto: " . $e
            ];
        }

    }

    public function getProductos()
    {
        $db = new ConexionBD();
        try {
            $arrProductos = [];
            $stmt = $db->pdo->prepare(Sql::getProductos());
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["tallas"] = $this->getTallasEstocs($row["pro_id"], $db);
                array_push($arrProductos, $row);
            }
            return [
                "correcto" => true,
                "productos" => $arrProductos
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al sacar los productos: " . $e
            ];
        }
    }

    public function getNovedades()
    {
        $db = new ConexionBD();
        try {
            $arrProductos = [];
            $stmt = $db->pdo->prepare(Sql::getNovedades());
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["tallas"] = $this->getTallasEstocs($row["pro_id"], $db);
                array_push($arrProductos, $row);
            }
            return [
                "correcto" => true,
                "productos" => $arrProductos
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al sacar las novedades: " . $e
            ];
        }
    }

    public function deleteProducto($arrayRequest)
    {
        $db = new ConexionBD();
        try {
            $proId = $arrayRequest["pro_id"];
            $stmt = $db->pdo->prepare(Sql::deleteProducto());
            $stmt->bindParam(':pro_id', $proId);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al borrar el producto: " . $e
            ];
        }
    }

    public function getContenidoFiltros()
    {
        $db = new ConexionBD();

        return [
            "correcto" => true,
            "datos" => [
                "marcas" => $this->getMarcas($db),
                "colores" => $this->getColores($db),
                "tallas" => $this->getTallas($db)
            ]
        ];
    }

    private function getMarcas($db)
    {
        $arrMarcas = [];
        $stmt = $db->pdo->prepare(Sql::getMarcasProductos());
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($arrMarcas, $row);
        }
        return $arrMarcas;
    }

    private function getColores($db)
    {
        $arrColores = [];
        $stmt = $db->pdo->prepare(Sql::getColores());
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($arrColores, $row);
        }
        return $arrColores;
    }

    private function getTallas($db)
    {
        $arrTallas = [];
        $stmt = $db->pdo->prepare(Sql::getTallas());
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($arrTallas, $row);
        }
        return $arrTallas;
    }

    private function getTallasEstocs($proId, $db)
    {
        $arrTallas = [];
        $stmt = $db->pdo->prepare(Sql::getTallasProducto());
        $stmt->bindParam(':pro_id', $proId);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($arrTallas, $row);
        }
        return $arrTallas;
    }

}