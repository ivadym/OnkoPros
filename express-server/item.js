function Item(
    id,
    titulo,
    tipo,
    valores,
    fecha_creacion
) {
    this.id = id || null;
    this.titulo = titulo || null;
    this.tipo = tipo || null;
    this.valores = valores || null;
    this.fecha_creacion = fecha_creacion || null;
}

Item.prototype.getId = function() {
    return this.id;
}

Item.prototype.setId = function(id) {
    this.id = id;
}

module.exports = Item;