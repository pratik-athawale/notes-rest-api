const dbName = process.env.NOTES_DB_NAME;
const dbUserName = process.env.NOTES_DB_USER;
const dbUserPassword = process.env.NOTES_DB_PASSWORD;

console.log('initializing user for notes db');

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