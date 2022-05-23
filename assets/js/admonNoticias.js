$(document).ready(function() {
    $.ajax({
        url: '/php/noticias/list.php',
        data: { limit: 5, offset: (findGetParameter("pagina") - 1) * 5 },
        success: function(data) {
            var json = $.parseJSON(data);
            $(json.resultados).each(
                function() {
                    $('#lista_examinar > tbody').append(
                        '<tr><td>' +
                        this.titulo +
                        '</td><td>' +
                        this.fecha +
                        '</td><td>' +
                        recortar(this.descripcion, 200) +
                        '</td><td class="text-center">' +
                        '<span class="clickeable material-icons" onClick="editar(' + this.noticia_id + ')">edit</span>' +
                        '</td><td class="text-center">' +
                        '<span class="clickeable material-icons" onClick="eliminar(' + this.noticia_id + ')">delete</span>' +
                        '</td></tr>')
                });
            calcularPaginacion(json.total, findGetParameter("pagina"), '/admon/noticias.html?');

        },
        error: function() {
            console.log('There was some error performing the AJAX call!');
        }
    });

    $('#descripcion_noticia').summernote({
        placeholder: 'Describir la noticia, puede agregar imágenes y videos.',
        tabsize: 2,
        height: 200,
        callbacks: {
            onPaste(e) {
                const bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                e.preventDefault();
                document.execCommand('insertText', false, bufferText);
            }
        }
    });
    $('#fecha_noticia').datetimepicker({timepicker:false, format:'Y/m/d'});

});

function agregarNuevaNoticia() {
    $("#editar").css("display", "");
    $("#editar").attr("idNoticia", "");
    $("#noticia-titulo").val("");
    $("#noticia-subtitulo").val("");
    $("#noticia-boton").val("");
    $('#descripcion_noticia').summernote('code', '');
    $("#image_file_noticia").html('');
    $("#problema_creando_noticia").css("display", "none");
    var json = new Object();
    json.titulo = "Título";
    json.subtitulo = "Subtítulo";
    json.boton = 'Encuentra más Información';
    json.url_imagen = '';
    completarNoticia(json, 0);
}

function cambiarValorImagen($this) {
    var files = !!$this.files ? $this.files : [];
    if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support
    if (/^image/.test(files[0].type)) { // only image file
        var reader = new FileReader(); // instance of the FileReader
        reader.readAsDataURL(files[0]); // read the local file

        reader.onloadend = function() { // set image data as background of div
            $("#noticia-imagen-0").attr("src",this.result);
        }
    }
}

function cambiarValorInput($this, id) {
    $("#" + id).html($($this).val());
}

function guardarNoticia() {
    var data = new FormData();
    data.append('imagen_noticia', $('#image_file_noticia').prop('files')[0]);
    data.append('titulo_noticia', $("#noticia-titulo").val());
    data.append('subtitulo_noticia', $("#noticia-subtitulo").val());
    data.append('fecha_noticia', $("#fecha_noticia").val());
    data.append('boton_noticia', $("#noticia-boton").val());
    data.append('descripcion_noticia', $("#descripcion_noticia").val());
    data.append('id', $("#editar").attr("idNoticia"));

    $.ajax({
        url: '/php/noticias/post.php',
        method: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
            console.log(data);
            if (data === "ok") {
                $("#enlace_noticias")[0].click();
            } else if (data.includes("location")) {
                var json = $.parseJSON(data);
                if (json.location) {
                    window.location.href = json.location;
                };
            } else {
                $("#problema_creando_noticia").css("display", "");
                console.log(data);
            }
        },
        error: function() {
            $("#problema_creando_noticia").css("display", "");
            console.log('There was some error performing the AJAX call!');
        }
    });
}

