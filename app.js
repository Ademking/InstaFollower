#!/usr/bin/env node

const chalk = require('chalk'); // console.log() Colors
const Client = require('instagram-private-api').V1; //Instagram API
const sleep = require('system-sleep'); // System Sleep
const fs = require('fs');
const prompt = require('prompt');
const path = require('path');

let USERNAME;
let PASSWORD;
let storage;

let connected = false;

const device = new Client.Device('someuser');

let ACCOUNT_DATA;

// Clear Cookies Folder
const clearFolder = () => {
    const directory = 'cookies';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

const followUser = tofollow => {

    // wait 1 sec for every follow
    sleep(1000);

    Client.Session.create(device, storage, USERNAME, PASSWORD)
        .then(function (session) {
            if (connected === false){
                console.log(chalk.green("\n Connected Successfully !\n"));
                connected = true;
            }
            return [session, Client.Account.searchForUser(session, tofollow)]
        })
        .spread(function (session, account) {

            return Client.Relationship.create(session, account.id);
        })
        .then(function (relationship) {
            let accountStatus = relationship.params.outgoing_request ? "(Private)" : "(Public)"
            console.log(` User ${chalk.green(tofollow)} ${accountStatus} - Followed`);

        })
        .catch(function (error) {
            if (error.name === 'IGAccountNotFoundError') {
                console.log(`${chalk.red(" User " + tofollow + " - Not Found!" )}`)
            } else {
                //console.log(`${chalk.red('\n Error - Please Check your Account!')}`);
                process.exit(1);
            }
        });


}


async function main() {

    clearFolder();

    console.log(chalk.green(
        `
 ██╗███╗   ██╗███████╗████████╗ █████╗ ███████╗ ██████╗ ██╗     ██╗      ██████╗ ██╗    ██╗
 ██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗██║     ██║     ██╔═══██╗██║    ██║
 ██║██╔██╗ ██║███████╗   ██║   ███████║█████╗  ██║   ██║██║     ██║     ██║   ██║██║ █╗ ██║
 ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██╔══╝  ██║   ██║██║     ██║     ██║   ██║██║███╗██║
 ██║██║ ╚████║███████║   ██║   ██║  ██║██║     ╚██████╔╝███████╗███████╗╚██████╔╝╚███╔███╔╝
 ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝╚══════╝ ╚═════╝  ╚══╝╚══╝ 
                                                                                          
`
    ));

    let prompt_attributes = [{
            name: 'username',
            validator: /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/,
            warning: 'Username is not valid ! Try Again ...',
            message: ' Your Instagram Username',
            required: true
        },
        {
            name: 'password',
            message: ' Your Instagram Password',
            hidden: true,
            required: true
        }
    ];

    // Remove first string 'prompt:'
    prompt.message = ''

    prompt.start();

    prompt.get(prompt_attributes, function (err, result) {
        if (err) {
            // Exit
            return 1;
        } else {
            // Get user input from result object.
            USERNAME = result.username;
            PASSWORD = result.password;

            storage = new Client.CookieFileStorage(__dirname + '\\cookies\\' + USERNAME + '.json');
            let array = fs.readFileSync('userslist.txt').toString().replace(/\r/g, '').split("\n");

            for (i in array) {
                followUser(array[i]);
            }

            clearFolder();
        }
    });
    

}

main();
