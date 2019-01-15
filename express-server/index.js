const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}) );

var Entrevista = require('./entrevista.js');
var Item = require('./item.js');
var Valor = require('./valor.js');

var entrevista_1 = new Entrevista(1, 'Entrevista 1', 'estado', 'f_creacion', 'f_limite');
var entrevista_2 = new Entrevista(2, 'Entrevista 2');
var entrevistas = [entrevista_1, entrevista_2];
var e1_cont = 0;
var e2_cont = 0;

var item_1 = new Item(1, 'Item 1', 'radio', ['A1', 'B', 'C', 'Otro'], '2019');
var item_2 = new Item(2, 'Item 2', 'radio', ['A2', 'B', 'C', 'Otro'], '2019');
var item_3 = new Item(3, 'Item 3', 'radio', ['A3', 'B', 'C', 'Otro'], '2019');
var items = [item_1, item_2, item_3];

var valores_e1 = [];
var valores_e2 = [];

/**
 * HEADERS
 */
app.use(function(req, res, next) {
  // CORS
  res.header("Access-Control-Allow-Origin", "*");
  // TODO: Authorization, Content-Length
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

/**
 * GET entrevistas
 */
app.get('/api/entrevistas', function(req, res, next) {
  console.log('GET entrevistas') // TODO: Fichero logs
  res.send(
    JSON.stringify(getEntrevistas())
  );
});

/**
 * GET entrevistas/:id
 */
app.get('/api/entrevistas/:id', function(req, res, next) {
  console.log(`GET entrevistas/${req.params['id']}`) // TODO: Fichero logs
  res.send(
    getItem(req.params['id'])
  );
});

/**
 * POST entrevista/:id
 */
app.post('/api/entrevistas/:id', function(req, res, next) {
  var id = req.params['id'];
  if (id == 1) {
    e1_cont++;
  } else if (id == 2) {
    e2_cont++;
  }

  console.log(`POST entrevistas/${id}`) // TODO: Fichero logs
  // TODO: Tratamiento de la respuesta
  var valor = new Valor(req.body.id, req.body.valor, req.body.valorTexto);
  setValor(id, valor);
  res.send(req.body);
});

/**
 * Extrae las entrevistas disponibles
 */
function getEntrevistas() {
  // TODO: Acceso BBDD/Replicacar petición a otro servidor
  return entrevistas;
}

/**
 * Extrae la siguiente pregunta asociada a la entrevista con id: id
 */
function getItem(id) {
  // TODO: Acceso BBDD
  if(id == 1) {
    var res = JSON.stringify([items[e1_cont]]);
    if(e1_cont == items.length) {
      borrarEntrevista(id);
    }
    return res;
  } else if (id == 2) {
    var res = JSON.stringify([items[e2_cont]]);
    if(e2_cont == items.length) {
      borrarEntrevista(id);
    }
    return res;
  }
};

/**
 * Guarda las respuestas del usuario en la BBDD
 */
function setValor(id, valor) {
  // TODO: Redirección segundo servidor/Acceso BDD
  if(id == 1) {
    valores_e1.push(valor);
  } else if (id == 2) {
    valores_e2.push(valor)
  }
}

/**
 * Borra las entrevistas realizadas 
 */
function borrarEntrevista(id) {
  // TODO: Acceso BBDD
  for (var i = 0; i < entrevistas.length; i++) {
    var obj = entrevistas[i];
    if (id == obj.id) {
        entrevistas.splice(i, 1);
    }
  }
  if (id == 1) {
    console.log(valores_e1);
  } else if (id == 2) {
    console.log(valores_e2);
  }
}

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port   
  console.log("Servidor iniciado en http://%s:%s", host, port)
})
