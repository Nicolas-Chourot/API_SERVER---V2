const Repository = require('../models/Repository');
const TokenManager = require('../tokenManager');
const utilities = require("../utilities");
const User = require('../models/user');

module.exports = 
class AccountsController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.usersRepository = new Repository('Users');
    }

    // todo mask password
    index(id) {
            if(!isNaN(id)) {
                let user =  this.usersRepository.get(id);
                if (user != null)
                    user = 
                this.response.JSON(this.usersRepository.get(id));
            }
            else {
                this.response.JSON(this.usersRepository.getAll());
            }
    }

    // POST: /token body payload[{"Email": "...", "Password": "...", "grant-type":"password"}]
    login(loginInfo) {
        // to do assure that grant-type is present in the reuqest header
        let user =  this.usersRepository.findByField("Email", loginInfo.Email);
        if (user != null){
            if (user.Password == loginInfo.Password) {
                let newToken = TokenManager.create(user.Email);
                console.log(newToken)
                this.response.JSON(newToken);
            } else
                this.response.badRequest();
        } else
            this.response.badRequest();
    }
    
    // POST: account/register body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
    register(user) {  
        user.Created = utilities.nowInSeconds();
        // validate User before insertion
        if (User.valid(user)) {
            // avoid duplicates Email
            if (this.usersRepository.findByField('Email', user.Email) == null) {
                let newUser = this.usersRepository.add(user);
                if (newUser) {
                    // mask password in the json object response
                    newUser.Password = "********";
                    this.response.created(newUser);
                } else
                    this.response.internalError();
            } else
                this.response.conflict();
        } else
            this.response.unprocessable();
    }
    // todo
    change(user) {
        this.response.notImplemented();
    }
    // todo
    delete(id) {
        this.response.notImplemented();
    }
}