const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://brentde:brentde@mycluster.2mmhx.mongodb.net/LineupOptimizer?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";

const dbService = {
    db: undefined,
    connect: () => { 
        return new Promise((resolve, reject) => {
                MongoClient.connect(uri, (err, db) => {
                    if(err){   
                        reject(err); 
                        MongoClient.close();
                    }

                    dbService.db = db;
                    console.log("Database Connected");
                    resolve();
            })
        })
    },
    cleanup: () => {
        return new Promise((resolve, reject) => {
            dbService.db.close();
            console.log("MongoDB closed...")
            resolve();
        })
    }
}

module.exports = dbService;