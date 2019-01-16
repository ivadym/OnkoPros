function Usuario(
    id,
    usuario,
    clave,
    estado,
    nombre,
    apellido_1,
    apellido_2,
    sexo,
    fecha_nacimiento,
    telefono,
    email,
    jwt
) {
    this.id = id || null;
    this.usuario = usuario || null;
    this.clave = clave || null;
    this.estado = estado || null;
    this.nombre = nombre || null;
    this.apellido_1 = apellido_1 || null;
    this.apellido_2 = apellido_2 || null;
    this.sexo = sexo || null;
    this.fecha_nacimiento = fecha_nacimiento || null;
    this.telefono = telefono || null;
    this.email = email || null;
    this.jwt = jwt || null;
}

Usuario.prototype.getId = function() {
    return this.id;
}

Usuario.prototype.setId = function(id) {
    this.id = id;
}

module.exports = Usuario;
