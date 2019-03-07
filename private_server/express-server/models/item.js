class Item {

    constructor(id, titulo, tipo, valores, fecha_creacion) {
        this.id = id || null;
        this.titulo = titulo || null;
        this.tipo = tipo || null;
        this.valores = valores || null;
        this.fecha_creacion = fecha_creacion || null;
    }
    
}

module.exports = Item;
