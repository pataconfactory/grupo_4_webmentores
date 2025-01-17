const path = require('path');
const {validationResult} = require('express-validator');
const bcryptjs = require('bcryptjs');
const db = require("../../database/models");
//const fetch = require('node-fetch');
//const {redirect} = require('express/lib/response');
//const { all } = require('express/lib/application');

const usersController = {
    listUsers: function (req, res) {
        db.User.findAll({
                include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "users_products"}
                ]
            })
            .then(function (users) {
                res.render(path.join(__dirname, '../views/users/listUsers'), {users})
            })
    },

    detailUsers: function (req, res) {
        db.User.findByPk(req.params.id, {
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"},
            ]
        }).then(function (user) {
            return res.render(path.join(__dirname, '../views/users/userDetail'), {user})
        })
    },

    register: function (req, res) {
        res.cookie();
        return res.render(path.join(__dirname, '../views/users/register'))
    },

    registerMentor: function (req, res) {
        res.cookie();
        return res.render(path.join(__dirname, '../views/users/registerMentor'))
    },

    login: function (req, res) {
        return res.render(path.join(__dirname, '../views/users/login'))
    },

    loginProcess: function (req, res) {
        let errors = validationResult(req);
        if (errors.errors.length > 0) {
            return res.render(path.join(__dirname, '../views/users/login'), {errors: errors.mapped(), old: req.body});
        }

        db.User.findOne({
            where: {
                email: req.body.email
            }
        }).then((userToLogin) => {
            let user = userToLogin.dataValues;
            if (user) {
                let isOkPassword = bcryptjs.compareSync(req.body.password, user.password);
                if (isOkPassword) {
                    delete user.password;
                    req.session.userLogged = user;
                    if (req.body.remember) {
                        res.cookie('userEmail', req.body.email, {maxAge: (1000 * 300)});
                    }
                    return res.redirect('/users/profile');
                }
                return res.render(path.join(__dirname, '../views/users/login'), {
                    errors: {
                        password: {msg: 'Las credenciales son inválidas'}
                    },
                    old: req.body
                });
            }
            return res.render(path.join(__dirname, '../views/users/login'), {
                errors: {
                    email: {msg: 'No se encuentra este email en nuestra base de datos'}
                },
                old: req.body
            });
        })
    },

    processRegister: function (req, res) {
        let errors = validationResult(req);
        if (errors.errors.length > 0) {
            return res.render(path.join(__dirname, '../views/users/register'), {errors: errors.mapped(), old: req.body});
        }
    
        db.User.findOne({
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"},
            ],
            where: {
                user_name: req.body.user_name
            }
        })
        .then(function (userNameRegistered) {
            let userNameInDB = userNameRegistered;
            if (userNameInDB != null) {
                return res.render(path.join(__dirname, '../views/users/register'), {
                    errors: {
                        user_name: {msg: 'Este nombre de usuario ya se encuentra registrado'}
                    },
                    old: req.body
                });
            } else {
                db.User.findOne({
                    include: [
                        {association: "roles"},
                        {association: "users"},
                        {association: "bookings_user"},
                        {association: "users_products"},
                    ],
                    where: {
                        email: req.body.email
                    }
                })
                .then(function (userEmailRegistered) {
                    let userEmailInDB = userEmailRegistered;
                    if (userEmailInDB != null) {
                        return res.render(path.join(__dirname, '../views/users/register'), {
                            errors: {
                                email: {msg: 'Este email ya se encuentra registrado'}
                            },
                            old: req.body
                        });
                    } else if (userEmailInDB == null) {
                        let passwordHasheada = bcryptjs.hashSync(req.body.password, 10);
                        if(req.file){
                            db.User.create({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                user_name: req.body.user_name,
                                email: req.body.email,
                                birthday: req.body.date_birth,
                                age: req.body.age,
                                genre: req.body.genero,
                                country: req.body.country,
                                password: passwordHasheada,
                                title: req.body.title,
                                avatar: req.file.filename,
                                role_id: req.body.category,
                                mentor_id: null
                            })
                            .then(function (newUser) {
                                if (req.session.userLogged) {
                                    if (req.session.userLogged.role_id == 2) {
                                    return res.redirect('/users/list');
                                    }
                                } else {
                                    return res.redirect('/users/login');
                                }
                            })
                        }
                    }
                })  
            }
        })
    },

    processRegisterMentor: function (req, res) {
        let errors = validationResult(req);
        if (errors.errors.length > 0) {
            return res.render(path.join(__dirname, '../views/users/registerMentor'), {errors: errors.mapped(), old: req.body});
        }
        
        db.User.findOne({
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"},
            ],
            where: {
                user_name: req.body.user_name
            }
        })
        .then(function (userNameRegistered) {
            let userNameInDB = userNameRegistered;
            if (userNameInDB != null) {
                return res.render(path.join(__dirname, '../views/users/registerMentor'), {
                    errors: {
                        user_name: {msg: 'Este nombre de usuario ya se encuentra registrado'}
                    },
                    old: req.body
                });
            } else {
                db.User.findOne({
                    include: [
                        {association: "roles"},
                        {association: "users"},
                        {association: "bookings_user"},
                        {association: "users_products"},
                    ],
                    where: {
                        email: req.body.email
                    }
                })
                .then(function (userEmailRegistered) {
                    let userEmailInDB = userEmailRegistered;
                    if (userEmailInDB != null) {
                        return res.render(path.join(__dirname, '../views/users/registerMentor'), {
                            errors: {
                                email: {msg: 'Este email ya se encuentra registrado'}
                            },
                            old: req.body
                        });
                    } else if (userEmailInDB == null) {
                        let passwordHasheada = bcryptjs.hashSync(req.body.password, 10);
                        let precioPorHora = parseInt(req.body.hour_price);
                        let precioPorHoraFinal = precioPorHora + (( precioPorHora * 30) / 100);
                        if(req.file){
                            db.Mentor.create({
                                description: req.body.description,
                                hour_price: precioPorHoraFinal,
                                cbu: req.body.cbu,
                                bank: req.body.bank
                            })
                            .then(function (newMentor) {
                                let mentorId = newMentor.mentor_id;
                                if(req.file){
                                    db.User.create({
                                        first_name: req.body.first_name,
                                        last_name: req.body.last_name,
                                        user_name: req.body.user_name,
                                        email: req.body.email,
                                        birthday: req.body.date_birth,
                                        age: req.body.age,
                                        genre: req.body.genero,
                                        country: req.body.country,
                                        password: passwordHasheada,
                                        title: req.body.title,
                                        avatar: req.file.filename,
                                        role_id: 3,
                                        mentor_id: mentorId
                                    })
                                    .then(function (newMentor) {
                                        if (req.session.userLogged) {
                                            if (req.session.userLogged.role_id == 2) {
                                                return res.redirect('/users/list');
                                            }
                                        } else {
                                            return res.redirect('/users/login');
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }            
        })
    },

    profile: function ( req, res ) {
        let id = req.session.userLogged.user_id;
        db.User.findByPk(id, {
                include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "bookings_user"},
                    {association: "users_products"},
                ]
            })
            .then(function (user) {
                return res.render(path.join(__dirname, '../views/users/profile'), {user});
            })
    },

    logout: function (req, res) {
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');
    },

    editUsers: function (req, res) {
        let userId = req.params.id;
        db.User.findByPk(userId, {
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"},
            ]
        })
        .then(function(user) {    
            return res.render(path.join(__dirname, '../views/users/userEdit'), {user});
        })
    },

    updateUsers: function (req, res) {
        let errors = validationResult(req);
        if (errors.errors.length > 0) {
            return res.render(path.join(__dirname, '../views/users/userEdit'), {errors: errors.mapped(), old: req.body});
        }

        if(req.file !== undefined){
            db.User.update({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                birthday: req.body.date_birth,
                age: req.body.age,
                genre: req.body.genero,
                country: req.body.country,
                title: req.body.title,
                avatar: req.file.filename,
            },{
                where: {
                    user_id: req.params.id
                }
            }).then(function(user){
                let id = req.session.userLogged.user_id;
                db.User.findByPk(id, {include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "bookings_user"},
                    {association: "users_products"},
                ]
                }).then(function(user){
                    return res.render(path.join(__dirname, '../views/users/profile'), {user});
                });
            });
        } else {  
            db.User.update({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                birthday: req.body.date_birth,
                age: req.body.age,
                genre: req.body.genero,
                country: req.body.country,
                title: req.body.title,
            },{
                where: {
                    user_id: req.params.id
                }
            }).then(function(user){
                let id = req.session.userLogged.user_id;
                db.User.findByPk(id, {include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "bookings_user"},
                    {association: "users_products"},
                ]
                }).then(function(user){
                    return res.render(path.join(__dirname, '../views/users/profile'), {user});
                });
            });
        }     
    },

    editUsersPassword: function ( req, res  ) {
        return res.render(path.join(__dirname, '../views/users/userEditPassword'), { user: req.session.userLogged});
    },

    updateUsersPassword: function (req, res) {
        let errors = validationResult(req);
        let id = req.session.userLogged.user_id;
        db.User.findByPk(id, {
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"},
            ]
        }).then(function (user) {
            if (errors.errors.length > 0) {
                return res.render(path.join(__dirname, '../views/users/userEditPassword'), { errors: errors.mapped(), old: req.body, user});
            }

            if (errors.errors.length == 0) {
                let isOkPassword = bcryptjs.compareSync(req.body.password_old, user.password);
                if (isOkPassword) {
                    let passwordHasheada = bcryptjs.hashSync(req.body.password, 10);
                    db.User.update({
                        password: passwordHasheada,
                    }, {
                        where: {
                            user_id: req.params.id
                        }
                    });
                    return res.render(path.join(__dirname, '../views/users/profile'), {user});
                } else {
                    return res.render(path.join(__dirname, '../views/users/userEditPassword'), {errors: {password_old: {msg: 'Las credenciales son inválidas'}},old: req.body});
                }
            }
        });  
    },

    editMentor: function ( req, res  ) {
        let mentorId = req.params.id;
        db.Mentor.findByPk(mentorId, {
            include: [
                {association: "mentors"},
                {association: "users"}
            ]
        })
        .then(function(mentor) { 
            let user = req.session.userLogged;   
            return res.render(path.join(__dirname, '../views/users/userEditMentor'), {mentor, user});
        })
    },

    updateMentor: function ( req, res  ) {
        let mentorId = req.params.id;
        let precioPorHora = parseInt(req.body.hour_price);
        let precioPorHoraFinal = precioPorHora + (( precioPorHora * 30) / 100);
        db.Mentor.update({
            description: req.body.description,
            hour_price: precioPorHoraFinal,
            CBU: req.body.cbu,
            bank: req.body.bank
            },{
            where: {
                mentor_id: mentorId
            }
        })
        return res.redirect('/users/profile');
    },

    destroyUsers: function (req, res) {
        db.User.findOne({
            include: [
                {association: "roles"},
                {association: "users"},
                {association: "bookings_user"},
                {association: "users_products"}
            ],
            where: {
                user_id: req.params.id
            }
        })
        .then(function (user) {
            if(user.mentor_id == null) {
                db.User.destroy({
                    where: {
                        user_id: req.params.id
                    }
                }).then(function(user){
                        return res.redirect('/users/list');
                });
            } else {
                db.User.destroy({
                    where: {
                        user_id: req.params.id
                    }
                });
                db.Mentor.destroy({
                    where: {
                        mentor_id: user.mentor_id
                    }
                })
                .then(function (resultado) {
                    return res.redirect('/users/list');
                });  
            }     
        })
    },

    searchRoles: function (req, res) {
        let role = req.body.roles;
        if(role == 0){
            db.User.findAll({
                include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "bookings_user"},
                    {association: "users_products"},
                ]
            })
            .then(function(users) {    
                return res.render(path.join(__dirname, '../views/users/listUsers'), {users});
            })
        } else {
            db.User.findAll({
                include: [
                    {association: "roles"},
                    {association: "users"},
                    {association: "bookings_user"},
                    {association: "users_products"},
                ],
                where: {
                    role_id: role
                    }
            })
            .then(function(users) {    
                return res.render(path.join(__dirname, '../views/users/listUsers'), {users});
            })
        }
    }

};

module.exports = usersController;