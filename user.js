//Start server
//.\mongod.exe --auth --port 27017 --dbpath="D:\Users\Kirian\Desktop\Nosql\data\db"

//Login 
//.\mongo.exe --port 27017 -u user_lecture -p 'lecture' --authenticationDatabase 'admin' 
//OR db.auth("root","root")

//Display Users list
db.getUsers();

//Create users
//use admin
db.createUser(
    {
        user: "adminuser",
        pwd: "mdp",
        roles: [
            {
                role: "readWrite",
                db: "tp"
            }
        ]
    }
);
db.createRole(
    {role: "adminrole",
        privileges: [
            {
                resource:
                    {
                        db:
                            "tp",
                        collection:""
                    },
                actions: ["find", "update", "insert", "remove"]
            }
            ],
        roles: [
            {
                role:"readWrite",
                db: "tp"
            }
        ]
    }
);
db.grantRolesToUser(
    "adminuser",
    ["adminrole"]
);