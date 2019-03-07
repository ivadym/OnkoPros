class Usuario {

    constructor(id, usuario, rol, nombre, apellido_1, apellido_2, sexo, fecha_nacimiento, telefono, email, estado, jwt) {
        this.id = id || null;
        this.usuario = usuario || null;
        this.rol = rol || null;
        this.nombre = nombre || null;
        this.apellido_1 = apellido_1 || null;
        this.apellido_2 = apellido_2 || null;
        this.sexo = sexo || null;
        this.fecha_nacimiento = fecha_nacimiento || null;
        this.telefono = telefono || null;
        this.email = email || null;
        this.estado = estado || null;
        this.jwt = jwt || null;
    }

}

module.exports = Usuario;
