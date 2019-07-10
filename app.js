import express from 'express';
import bodyParser from 'body-parser';
import models, { sequelize } from './models';
import db from './db';


const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(async (req, res, next) => {
    req.context = {
      models
    };
    next();
});  


// get all todos
app.get('/api/v1/users', async (req, res) => {
    // const users = get_users(models.User)
    const users = await req.context.models.User.findAll({
        include:[models.Goal]
    })

    // return res.status(200).send({
    //     success: 'true',
    //     message:  'users retrieved successfully',
    //     users: users})

    return users && Object.prototype.toString.call(users) ==='[object Array]' ? res.status(200).send({
        success: 'true',
        message:  'users retrieved successfully',
        users: users})
        : res.status(404).send({
            success: 'true',
            message: 'no users found!',
            users: users});
});


const validate_user_data = req =>{
    const username = req.body.username;
    const birthday = req.body.birthday;
    const email = req.body.email;
    const goals = req.body.goals ? req.body.goals : null;

    console.log(`\n\n >><<<>>> ${username} ${email} ${birthday} ${goals}`);

    return !username || !birthday || !email ? false: {username, email, birthday, goals};
};

app.post('/api/v1/users', (req, res) => {
    console.log(`\n\n ?>>++++>> ${validate_user_data(req)}`)

    if (!validate_user_data(req)) {
        return res.status(400).send({
            success: 'false',
            message: 'username, birthday and email fields are required!'
            })
    }
    const user_ = validate_user_data(req)
    user_.birthday = new Date(user_.birthday)

    user_.goals ? createUsersWithGoals(user_.username, user_.birthday, user_.email, user_.goals) : 
            createUsersWithGoals(user_.username, user_.birthday, user_.email)
    
    return res.status(201).send({
        success: 'true',
        message: 'user added successfully',
        user: user_
    })
});



app.get('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.map((todo) => {
        if (todo.id === id) {
        return res.status(200).send({
            success: 'true',
            message: 'todo retrieved successfully',
            todo,
        });
        } 
    });
    return res.status(404).send({
        success: 'false',
        message: 'todo does not exist',
    });
});


app.delete('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.map((todo, index) => {
      if (todo.id === id) {
         db.splice(index, 1);
         return res.status(200).send({
           success: 'true',
           message: 'Todo deleted successfuly',
         });
      }
    });
    return res.status(404).send({
    success: 'false',
    message: 'todo not found',
    });

});


app.put('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if(!req.body.title || !req.body.description) {
        return res.status(400).send({
        success: 'false',
        message: 'Please provide either of title or description fields to be updated!'
        });
    } 
    
    db.map((todo, index) => {
      if (todo.id === id) {
        const new_todo = {
            id: todo.id,
            title: req.body.title,
            description: req.body.description
        }
         db[index] = new_todo
         return res.status(200).send({
           success: 'true',
           message: 'Todo updated successfuly',
         });
      }
    });
    return res.status(404).send({
    success: 'false',
    message: 'todo not found',
    });

});

const eraseDatabaseOnSync = !true;

sequelize
    .sync({ force: eraseDatabaseOnSync })
    .then(async () => {
        // if (eraseDatabaseOnSync){
        //     createUsersWithGoals();
        // }

        app.listen(process.env.PORT, () => {
            console.log(`Example app listening on port ${process.env.PORT}!`)
        })
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


const createUsersWithGoals = async (username, birthday, email, goals=[]) => {
    console.log(`\n\n Vars here ${username} >>>>${email} ${birthday} ${goals}`)
    await models.User.create(
        {
        username,
        birthday,
        email, 
        goals: goals ? goals.map(goal=>({"text": goal})): goals,
        },
        {
        include: [models.Goal],
        },
    );
};