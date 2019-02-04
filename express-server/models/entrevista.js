class Entrevista {

    constructor(id, titulo, descripcion, estado, fecha_creacion, fecha_limite) {
        this.id = id || null;
        this.titulo = titulo || null;
        this.descripcion = descripcion || null;
        this.estado = estado || null;
        this.fecha_creacion = fecha_creacion || null;
        this.fecha_limite = fecha_limite || null;
    }

}

module.exports = Entrevista;
