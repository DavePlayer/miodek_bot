import { create } from "domain";
import { InsertManyResult, ListDatabasesResult, MongoClient } from "mongodb";

interface IUser {
    name: string;
    ClientId: string;
    rolesNames: Array<string>;
    rolesIds: Array<string>;
}

class DatabaseC {
    mongoLink: string | null;
    client: MongoClient | null;

    constructor() {
        this.mongoLink = null;
        this.client = null;
    }

    establishConnection = async (mongoString?: string) => {
        this.mongoLink = mongoString || null;
        if (this.mongoLink) {
            this.client = new MongoClient(this.mongoLink);
            try {
                await this.client.connect();
                await this.listUsers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    listUsers = async () => {
        const databasesList: ListDatabasesResult = await this.client.db().admin().listDatabases();
        console.log(databasesList);
    };

    insertNewUser = async (user: IUser) => {
        const results = await this.client.db("miodek").collection("users").insertOne(user);
        console.log(`new user created: ${user.name}`);
    };
    insertNewUsers = async (users: Array<IUser>) => {
        const results: InsertManyResult<Document> = await this.client
            .db("miodek")
            .collection("users")
            .insertMany(users);
        console.log(`${results.insertedCount} users were created`);
    };
    getUser = async (user: IUser) => {
        const gotUser = await this.client.db("miodek").collection("users").findOne({ ClientId: user.ClientId });
        console.log(gotUser);
    };

    // update if exist | create if not existing
    upsertUser = async (user: IUser) => {
        const upsertedUser = await this.client
            .db("miodek")
            .collection("users")
            .updateOne({ ClientId: user.ClientId }, user, { upsert: true });
    };

    //remove users with no roles
    purgeDatabase = async () => {
        const result = await this.client
            .db("miodek")
            .collection("users")
            .deleteMany({
                rolesIds: { $e: 0 },
                rolesNames: { $e: 0 },
            });
        console.log(`${result.deletedCount} users were purged`);
    };
}

export default new DatabaseC();
