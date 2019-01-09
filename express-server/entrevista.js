function Entrevista(
    id,
    titulo,
    estado,
    fecha_creacion,
    fecha_limite
) {
    this.id = id || null;
    this.titulo = titulo || null;
    this.estado = estado || null;
    this.fecha_creacion = fecha_creacion || null;
    this.fecha_limite = fecha_limite || null;
}

Entrevista.prototype.getId = function() {
    return this.id;
}

Entrevista.prototype.setId = function(id) {
    this.id = id;
}

module.exports = Entrevista;
