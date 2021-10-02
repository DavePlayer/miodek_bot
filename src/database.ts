import { create } from "domain";
import { InsertManyResult, ListDatabasesResult, MongoClient, ObjectId } from "mongodb";

export interface IUser {
    name: string;
    ClientId: string;
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
                // await this.listUsers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    validateCollection = (collectionName: string): Promise<any> =>
        new Promise((res, rej) => {
            this.client
                .db("miodek")
                .listCollections({ name: collectionName })
                .next((err, collinfo) => {
                    if (!err) {
                        if (collinfo == null) {
                            this.client
                                .db("miodek")
                                .createCollection(collectionName)
                                .then(() => {
                                    console.log(`collection ${collectionName} created`);
                                    res(collectionName);
                                })
                                .catch((err) => rej(err));
                        } else {
                            console.log(`collection ${collectionName} exists`);
                            res(collectionName);
                        }
                    } else {
                        console.log(err);
                        rej(err);
                    }
                });
        });

    listUsers = async () => {
        const databasesList: ListDatabasesResult = await this.client.db().admin().listDatabases();
        console.log(databasesList);
    };

    insertNewUser = async (user: IUser, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            await this.client.db("miodek").collection(collectionName).insertOne(user);
            console.log(`new user created: ${user.name}`);
        } catch (error) {
            console.log(error);
        }
    };
    insertNewUsers = async (users: Array<IUser>, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const results = await this.client
                .db("miodek")
                .collection(collectionName)
                .insertMany(users, { ordered: false });
            console.log(`${results.insertedCount} users were created`);
        } catch (error) {
            console.log(error);
        }
    };
    getUser = async (user: IUser, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const gotUser = await this.client
                .db("miodek")
                .collection(collectionName)
                .findOne({ ClientId: user.ClientId });
            console.log(gotUser);
            return gotUser;
        } catch (error) {
            console.log(error);
        }
    };

    // update if exist | create if not existing
    upsertUser = async (user: IUser, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const upsertedUser = await this.client
                .db("miodek")
                .collection(collectionName)
                .updateOne({ ClientId: user.ClientId }, { $set: { rolesIds: user.rolesIds } }, { upsert: true });
            console.log(`updated ${user.name}`);
        } catch (error) {
            console.log(error);
        }
    };

    resetDataBase = async (collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const result = await this.client.db("miodek").collection(collectionName).deleteMany({});
            console.log(`removed ${result.deletedCount} documents`);
        } catch (error) {
            console.log(error);
        }
    };

    //remove users with no roles
    purgeDatabase = async (user: IUser, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const result = await this.client
                .db("miodek")
                .collection(collectionName)
                .deleteMany({
                    rolesIds: { $e: 0 },
                    rolesNames: { $e: 0 },
                });
            console.log(`${result.deletedCount} users were purged`);
        } catch (error) {
            console.log(error);
        }
    };
}

export default new DatabaseC();
