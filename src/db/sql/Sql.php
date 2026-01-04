<?php

class Sql {
    public static function nuevoRegistro() {
        return "INSERT INTO usuarios (usu_nombre, usu_email, usu_rol, usu_password_hash) values (:nombre, :email, :rol, :password)";
    }
    
    public static function loginUsuario() {
        return "SELECT * FROM usuarios where usu_email=:email";
    }

    public static function getUsuarios() {
        return "SELECT * FROM usuarios";
    }

    public static function getUsuario() {
        return "SELECT * FROM usuarios where usu_id=:usu_id";
    }

    public static function updateUsuario() {
        return "UPDATE usuarios set usu_nombre=:nombre, usu_email=:email, usu_rol=:rol WHERE usu_id=:usu_id";
    }

    public static function updatePassword() {
        return "UPDATE usuarios set usu_password_hash=:password WHERE usu_id=:usu_id";
    }

    public static function deleteUsuario() {
        return "DELETE FROM usuarios where usu_id=:usu_id";
    }

    public static function actualizarDatosUsuario() {
        return "UPDATE usuarios set usu_nombre=:nombre, usu_direccion=:direccion, usu_codpostal=:codpostal, usu_poblacion=:poblacion, usu_provincia=:provincia, usu_telefono=:telefono, usu_email=:email WHERE usu_id=:usu_id";
    }

    public static function nuevoProducto() {
        return "INSERT INTO productos (pro_nombre, pro_marca, pro_tipo, pro_color, pro_precio, pro_imagen) values (:nombre, :marca, :tipo, :color, :precio, :imagen)";
    }

    public static function nuevaTalla() {
        return "INSERT INTO tallas_productos (tall_pro_id, tall_talla, tall_estoc) values (:pro_id, :talla, :estoc)";
    }

    public static function updateTalla() {
        return "UPDATE tallas_productos set tall_talla=:talla, tall_estoc=:estoc WHERE tall_id=:tall_id";
    }

    public static function deleteTalla() {
        return "DELETE FROM tallas_productos where tall_id=:tall_id";
    }

    public static function updateProducto() {
        return "UPDATE productos set pro_nombre=:nombre, pro_marca=:marca, pro_tipo=:tipo, pro_color=:color, pro_precio=:precio, pro_imagen=:imagen WHERE pro_id=:pro_id";
    }

    public static function getProductos() {
        return "SELECT * FROM productos";
    }

    public static function getNovedades() {
        return "SELECT * FROM productos ORDER BY pro_id DESC LIMIT 4";
    }

    public static function deleteProducto() {
        return "DELETE FROM productos where pro_id=:pro_id";
    }

    public static function getTallasProducto() {
        return "SELECT * FROM tallas_productos where tall_pro_id=:pro_id";
    }

    public static function getMarcasProductos() {
        return "SELECT distinct(pro_marca) from productos order by pro_marca ASC";
    }

    public static function getColores() {
        return "SELECT distinct(pro_color) from productos order by pro_color ASC";
    }

    public static function getTallas() {
        return "SELECT distinct(tall_talla) from tallas_productos order by tall_talla ASC";
    }

    public static function nuevoPedido() {
        return "INSERT INTO pedidos (ped_usu_id) values (:usu_id)";
    }
    
    public static function nuevaLineaPedido() {
        return "INSERT INTO pedidos_lineas (pel_ped_id, pel_pro_id, pel_unidades, pel_talla, pel_precio) values (:ped_id, :pro_id, :unidades, :talla, :precio)";
    }

    public static function consultaPedidos() {
        return "SELECT * FROM pedidos where ped_usu_id=:usu_id and ped_fecha BETWEEN :desde AND :hasta ORDER BY ped_fecha desc";
    }

    public static function getLineasPedido() {
        return "SELECT pro_nombre, pro_marca, pro_tipo, pro_color, pro_imagen, pel_unidades, pel_talla, pel_precio  FROM pedidos_lineas JOIN productos ON pel_pro_id=pro_id WHERE pel_ped_id=:ped_id";
    }
}