const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const {username} = request.headers;

    //validando se recebemos o parâmetro
    if(typeof(username) == "undefined"){
      return response.status(422).json({"error":"required parameter username"});
    }

    const user = users.find(user => user.username === username);

    if(!user){
      return response.status(400).json({"error":"user not found!"});
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {

  const {name , username} = request.body;

  //validando se recebemos o parâmetro
  if(typeof(name) == "undefined"){
    return response.status(422).json({"error":"required parameter name"});
  }

  //validando se recebemos o parâmetro
  if(typeof(username) == "undefined"){
    return response.status(422).json({"error":"required parameter username"});
  }

  //validando se já existe o username
  const userExists = users.some(
    (user) => user.username === username
  );

  if(userExists){
      return response.status(400).json({"error":"username already exists!"});
  }
    
  const user = { 
    id: uuidv4(),
    name: name, 
    username: username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  
  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title , deadline} = request.body;

  //validando se recebemos o parâmetro
  if(typeof(title) == "undefined"){
    return response.status(422).json({"error":"required parameter title"});
  }

  //validando se recebemos o parâmetro
  if(typeof(deadline) == "undefined"){
    return response.status(422).json({"error":"required parameter deadline"});
  }

  const deadlineDate = new Date(deadline);
  //validando se é uma data válida
  if(isNaN(deadlineDate.getTime())){
    return response.status(400).json({"error":"deadline in wrong format"});
  }

  const todo = {
    id: uuidv4(), 
    title: title,
    done: false, 
    deadline: deadlineDate, 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title , deadline} = request.body;
  const {id} = request.params;

  //validando se recebemos o parâmetro
  if(typeof(title) == "undefined"){
    return response.status(422).json({"error":"required parameter title"});
  }

  //validando se recebemos o parâmetro
  if(typeof(deadline) == "undefined"){
    return response.status(422).json({"error":"required parameter deadline"});
  }  

  //validando se recebemos o parâmetro
  if(typeof(id) == "undefined"){
    return response.status(422).json({"error":"required parameter id"});
  }  

  const deadlineDate = new Date(deadline);
  //validando se é uma data válida
  if(isNaN(deadlineDate.getTime())){
    return response.status(400).json({"error":"deadline in wrong format"});
  }
  
  const todo = user.todos.find(todo => todo.id === id);
  
  if(!todo){
    return response.status(404).json({"error":"todo not found!"});
  }

  todo.title = title;
  todo.deadline = deadlineDate;  

  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  //validando se recebemos o parâmetro
  if(typeof(id) == "undefined"){
    return response.status(422).json({"error":"required parameter id"});
  }
  
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({"error":"todo not found!"});
  }

  todo.done = true;

  return response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  //validando se recebemos o parâmetro
  if(typeof(id) == "undefined"){
    return response.status(422).json({"error":"required parameter id"});
  }
  
  const todo = user.todos.findIndex(todoIndex => todoIndex.id === id);
  if(todo == -1){
    return response.status(404).json({"error":"todo not found!"});
  }

  user.todos.splice(todo,1);
  
  return response.status(204).json(user);

});

module.exports = app;