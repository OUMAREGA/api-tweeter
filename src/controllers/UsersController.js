const User = require('../models/UserModel');
const crypto = require('crypto');

const bcrypt = require('bcrypt');

const saltRound = 10;

const fetch = require('node-fetch')

require('dotenv').config()

//Controller pour User
let UserController = {

    //Créé un User

    create: function (req, res) {

        let repassword = req.body.inputPasswordC;
        let password = req.body.inputPassword;
        let userEmail = req.body.inputEmail;
        let userPseudo = req.body.inputPseudo;
        let erreurs = [];

        //Vérifie si l'email existe déjà

        User.find({ 'email': userEmail }, function (err, usr) {
            if (usr.length > 0) {
                //Si le mail est déjà utilisé
                erreurs.push('Cet email est utilisé pour un autre compte');
            }
        });

        if (password !== repassword) {
            erreurs.push('Les mots de passe ne correspondent pas.');
        }



        //Generation d'un Password hash basé sur sha1

        //Creation de User

        let user = new User();
        user.pseudo = userPseudo;
        user.email = userEmail;
        user.password = password; //gérer hashage ensuite


        user.save(function (err) {

            if (err) {
                erreurs.push(err.errors.pseudo.message);
            }

            if (erreurs.length > 0) {
                res.render("form-sign.ejs", { erreurs: erreurs });
                return;
            } else {

                res.redirect("/connexion");
                return;
            }
        });

    },

    connect: function (req, res) {

        const identifier = req.body.identifiant;
        const password = req.body.password;
        const erreurs = [];

        //L'identifiant peut être un pseudo ou email
        User.find().or([{ pseudo: identifier }, { email: identifier }])
            .then(users => {
                if (users.length === 0) {
                    erreurs.push('Vérifiez vos identifiants');
                    res.render("connexion.ejs", { erreurs: erreurs });
                } else {

                    bcrypt.compare(password, users[0].password, function (err, result) {

                        if (result == true) {
                            req.session.connected = true;
                            req.session.userData = users[0];
                            res.redirect('/');
                        } else {
                            erreurs.push('Mot de passe incorrect');
                            res.render("connexion.ejs", { erreurs: erreurs });
                        }
                    });

                }
            })
            .catch(error => {
                erreurs.push('Erreur lors de la connexion');
                res.render("connexion.ejs", { erreurs: erreurs });
            });
    },
    logout: function(req, res){
        req.session.destroy(function(error){  
            if(error){  
                res.send("500 Server Error !");
            }  
            else  
            {  
                res.redirect('/connexion');  
            }  
        });  
    },

    getUserTweet: function(req, res){
        
        fetch("https://api.twitter.com/1.1/search/tweets.json?q=from:BekoFere", {
        method: "GET",
        headers: {
            "Authorization": process.env.TOKEN
                }
            }).then(res => res.json())
                    .then(json => console.log(json));
                }
}

module.exports = UserController;

