function Valor(
    id,
    valor,
    valorTexto
) {
    this.id = id || null;
    this.valor = valor || null;
    this.valorTexto = valorTexto || null;
}

Valor.prototype.getId = function() {
    return this.id;
}

Valor.prototype.setId = function(id) {
    this.id = id;
}

module.exports = Valor;