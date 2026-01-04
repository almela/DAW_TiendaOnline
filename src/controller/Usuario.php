<?php

class Usuario
{

    public function getUsuarios()
    {
        $db = new ConexionBD();
        try {
            $arrUsuarios = [];
            $stmt = $db->pdo->prepare(Sql::getUsuarios());
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($arrUsuarios, $row);
            }
            return [
                "correcto" => true,
                "usuarios" => $arrUsuarios
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al sacar los usuarios: " . $e
            ];
        }
    }

    public function updateUsuario($arrayRequest)
    {
        $db = new ConexionBD();
        try {
            $stmt = $db->pdo->prepare(Sql::updateUsuario());
            $stmt->bindParam(':nombre', $arrayRequest["nombre"]);
            $stmt->bindParam(':email', $arrayRequest["email"]);
            $stmt->bindParam(':rol', $arrayRequest["rol"]);
            $stmt->bindParam(':usu_id', $arrayRequest["usu_id"]);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al actualizar al usuario: " . $e
            ];
        }
    }

    public function actualizarDatosUsuario($arrayRequest)
    {
        $db = new ConexionBD();
        $usuId = $_SESSION["usu_id"];

        $nombre = $arrayRequest['nombre'];
        $email = $arrayRequest['email'];
        $telefono = ($arrayRequest['telefono'] !== '') ? $arrayRequest['telefono'] : null;
        $direccion = ($arrayRequest['direccion'] !== '') ? $arrayRequest['direccion'] : null;
        $cp = ($arrayRequest['cp'] !== '') ? $arrayRequest['cp'] : null;
        $poblacion = ($arrayRequest['poblacion'] !== '') ? $arrayRequest['poblacion'] : null;
        $provincia = ($arrayRequest['provincia'] !== '') ? $arrayRequest['provincia'] : null;

        try {
            $stmt = $db->pdo->prepare(Sql::actualizarDatosUsuario());
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':direccion', $direccion);
            $stmt->bindParam(':codpostal', $cp);
            $stmt->bindParam(':poblacion', $poblacion);
            $stmt->bindParam(':provincia', $provincia);
            $stmt->bindParam(':telefono', $telefono);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':usu_id', $usuId);
            $stmt->execute();

            $_SESSION["usu_nombre"] = $nombre;
            $_SESSION["usu_email"] = $email;

            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al actualizar el usuario: " . $e
            ];
        }
    }

    public function cambiarPassword($arrayRequest)
    {
        $db = new ConexionBD();
        $usuId = $_SESSION["usu_id"];
        $passwordActual = $arrayRequest["password_actual"];
        $passwordNuevo = $arrayRequest["password_nueva"];
        try {
            $usuario = $this->getDatosUsuario();
            if ($usuario["correcto"]) {
                if (password_verify($passwordActual, $usuario["usuario"]["usu_password_hash"])) {
                    $passwordHash = password_hash($passwordNuevo, PASSWORD_DEFAULT);
                    $stmt = $db->pdo->prepare(Sql::updatePassword());
                    $stmt->bindParam(':password', $passwordHash);
                    $stmt->bindParam(':usu_id', $usuId);
                    $stmt->execute();
                    return [
                        "correcto" => true,
                        "error" => ""
                    ];

                } else {
                    return [
                        "correcto" => false,
                        "error" => "La contraseña actual no coincide"
                    ];
                }
            } else {
                return [
                    "correcto" => false,
                    "error" => "Ha ocurrido un error al recuperar el usuario"
                ];
            }
        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al cambiar la contraseña: " . $e
            ];
        }
    }

    public function getDatosUsuario()
    {
        $db = new ConexionBD();
        $usuId = $_SESSION["usu_id"];
        try {
            $stmt = $db->pdo->prepare(Sql::getUsuario());
            $stmt->bindParam(':usu_id', $usuId);
            $stmt->execute();
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                return [
                    "correcto" => true,
                    "usuario" => $row
                ];
            }

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al sacar el usuario: " . $e
            ];
        }
    }

    public function deleteUsuario($arrayRequest)
    {
        $db = new ConexionBD();
        try {
            $usuId = $arrayRequest["usu_id"];
            $stmt = $db->pdo->prepare(Sql::deleteUsuario());
            $stmt->bindParam(':usu_id', $usuId);
            $stmt->execute();

            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al borrar el usuario: " . $e
            ];
        }
    }

}