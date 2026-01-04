<?php

class ConexionBD {

	public $pdo;

	public function __construct() {
		require '../vendor/autoload.php';

        $dotenv = Dotenv\Dotenv::createImmutable('../');
        $dotenv->load();

		try {
			$this->pdo=new PDO("mysql:host=".$_ENV["MYSQL_HOST"].";dbname=".$_ENV["DB_NAME"], $_ENV["DB_USER"], $_ENV["DB_PASS"]);
			$this->pdo->exec("set names utf8");
		} catch (Exception $e) {
			echo "Error: ".$e->getMessage();
		}
	}

	public function pdo() {
		return $this->pdo;
	}

}