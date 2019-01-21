class Usuario {

    constructor(id, usuario, nombre, apellido_1, apellido_2, estado, sexo, fecha_nacimiento, telefono, email) {
        this.id = id || null;
        this.usuario = usuario || null;
        this.nombre = nombre || null;
        this.apellido_1 = apellido_1 || null;
        this.apellido_2 = apellido_2 || null;
        this.estado = estado || null;
        this.sexo = sexo || null;
        this.fecha_nacimiento = fecha_nacimiento || null;
        this.telefono = telefono || null;
        this.email = email || null;
    }

}

module.exports = Usuario;
