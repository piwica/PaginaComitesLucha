<?php

include_once '../config/configbd.php';
include_once '../config/configparameters.php';
include_once "../utils/session_required.php";
include_once "../utils/session_extended.php";


mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$titulo =  $_POST['titulo_noticia'];
$autor =  $_POST['autor_noticia'];
$fecha =  $_POST['fecha_noticia'];
$categoria =  $_POST['categoria_noticia'];
$descripcion =  $_POST['descripcion_noticia'];
$publicacion =  $_POST['publicacion_noticia'];
$id =  $_POST['id'];

if (empty($fecha)){
    $fecha=date('Y-m-d H:i:s');
}

if (isset($_FILES['imagen_noticia']) && 0 < $_FILES['imagen_noticia']['error']) {
    echo 'Error: ' . $_FILES['imagen_noticia']['error'] . '<br>';
} else {
    if (!isset($_FILES['imagen_noticia'])) {
        //Subir datos
        if (empty($id)) {
            $stmt = mysqli_prepare($mysqli, "INSERT INTO actualidad (titulo, autor, categoria, fecha,  descripcion, publicacion) VALUES (?, ?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "ssssss", $titulo, $autor, $categoria, $fecha, $descripcion, $publicacion);
        } else {
            $stmt = mysqli_prepare($mysqli, "UPDATE actualidad SET titulo=? , autor=?, categoria=?, fecha= ?, descripcion = ?, publicacion = ? WHERE actualidad_id = ?");
            mysqli_stmt_bind_param($stmt, "ssssssi", $titulo, $autor, $categoria, $fecha, $descripcion, $publicacion, $id);
        }
    } else {
        //Subir archivo
        $test = explode('.', $_FILES['imagen_noticia']['name']);
        $extension = end($test);
        $imgtitulo = preg_replace('/[^A-Za-z0-9\-]/', '', $titulo);
        $name = str_replace(' ', '_', $imgtitulo) . rand(100, 999) . '.' . $extension;
        $location = 'upload/' . $name;
        move_uploaded_file($_FILES['imagen_noticia']['tmp_name'], $location);
        $location = $path_actualidad . $location;

        //Subir datos
        if (empty($id)) {
            $stmt = mysqli_prepare($mysqli, "INSERT INTO actualidad (titulo, autor, categoria, fecha,  descripcion, url_imagen, publicacion) VALUES (?, ?, ?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "sssssss",$titulo, $autor, $categoria, $fecha, $descripcion, $location, $publicacion);
        } else {
            $stmt = mysqli_prepare($mysqli, "UPDATE actualidad SET  titulo=? , autor=?, categoria=?, fecha= ?, descripcion = ?, url_imagen = ?, publicacion = ? WHERE actualidad_id = ?");
            mysqli_stmt_bind_param($stmt, "sssssssi",$titulo, $autor, $categoria, $fecha, $descripcion, $location, $publicacion, $id);
        }
    }
    /* execute query */
    mysqli_stmt_execute($stmt);

    $ultimoInsertar=mysqli_stmt_insert_id($stmt);
    if  (!empty($id)){
        $ultimoInsertar = $id;
    }
    
    echo json_encode(['resultado' => 'ok', 'publicacion' => $path_obtener_actualidad.'?id='.$ultimoInsertar]);
}