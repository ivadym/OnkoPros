class Entrevista {

    constructor(id, titulo, descripcion, instr_1, instr_2, estado, fecha_creacion, fecha_limite) {
        this.id = id || null;
        this.titulo = titulo || null;
        this.descripcion = descripcion || null;
        this.instr_1 = instr_1 || null;
        this.instr_2 = instr_2 || null;
        this.estado = estado || null;
        this.fecha_creacion = fecha_creacion || null;
        this.fecha_limite = fecha_limite || null;
    }

}

module.exports = Entrevista;
