<?php

class Auth
{

    public function hazLogin($arrayRequest)
    {
        $email = $arrayRequest["email"];
        $password = $arrayRequest["password"];

        $db = new ConexionBD();
        try {
            $stmt = $db->pdo->prepare(Sql::loginUsuario());
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if (password_verify($password, $row["usu_password_hash"])) {
                    # Coincide la contraseña
                    $_SESSION["usu_id"] = $row["usu_id"];
                    $_SESSION["usu_nombre"] = $row["usu_nombre"];
                    $_SESSION["usu_email"] = $row["usu_email"];
                    $_SESSION["usu_rol"] = $row["usu_rol"];
                    return [
                        "correcto" => true,
                        "datos" => $_SESSION
                    ];
                }
                return [
                    "correcto" => false,
                    "error" => "Contraseña incorrecta"
                ];
            }
            return [
                "correcto" => false,
                "error" => "No se ha encontrado el usuario en la base de datos"
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al identificarse: " . $e
            ];
        }

    }

    public function registro($arrayRequest)
    {
        $nombre = $arrayRequest["nombre"];
        $email = $arrayRequest["email"];
        $password = $arrayRequest["password"];

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $db = new ConexionBD();
        try {
            $rol = (isset($arrayRequest["rol"])) ? $arrayRequest["rol"] : 'CLIENTE';
            $stmt = $db->pdo->prepare(Sql::nuevoRegistro());
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':rol', $rol);
            $stmt->bindParam(':password', $passwordHash);
            $stmt->execute();
            return [
                "correcto" => true,
                "error" => ""
            ];

        } catch (Exception $e) {
            return [
                "correcto" => false,
                "error" => "Error al registrar el usuario: " . $e
            ];
        }
    }

}