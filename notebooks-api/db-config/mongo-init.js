const dbName = process.env.NOTEBOOKS_DB_NAME;
const dbUserName = process.env.NOTEBOOKS_DB_USER;
const dbUserPassword = process.env.NOTEBOOKS_DB_PASSWORD;

console.log('initializing user for notebooks db');

db = db.getSiblingDB(dbName);

db.createUser(
    {
        user: dbUserName,
        pwd: dbUserPassword,
        roles: [
            {
                role: 'readWrite',
                db: dbName
            }
        ]
    }
)