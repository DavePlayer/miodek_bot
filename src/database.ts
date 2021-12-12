import { OverwriteType, ReactionUserManager } from "discord.js";
import { create } from "domain";
import { FindCursor, InsertManyResult, ListDatabasesResult, MongoClient, ObjectId } from "mongodb";

export interface IUser {
    name: string;
    ClientId: string;
    rolesIds: Array<string>;
}

export interface ITwitchUser {
    discordChannelId: string;
    twitchChannelId: string;
    twitchClientId: string;
    twitchToken: string;
    serverName: string;
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
            } catch (err) {
                console.error(`Database: \n${err}`);
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
                                    console.log(`Database: collection ${collectionName} created`);
                                    res(collectionName);
                                })
                                .catch((err) => rej(err));
                        } else {
                            console.log(`Database: collection ${collectionName} exists`);
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
            console.log(`Database: new user created: ${user.name}`);
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
            console.log(`Database: ${results.insertedCount} users were created`);
        } catch (error) {
            console.log(error);
        }
    };
    getUser = async (ClientId: string, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const gotUser = await this.client.db("miodek").collection(collectionName).findOne({ ClientId: ClientId });
            console.log(gotUser);
            return gotUser;
        } catch (error) {
            console.log(error);
        }
    };
    removeUser = async (ClientId: string, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const removedUser = await this.client
                .db("miodek")
                .collection(collectionName)
                .deleteOne({ ClientId: ClientId });
            console.log(removedUser);
            return removedUser;
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
                .updateOne(
                    { ClientId: user.ClientId },
                    { $set: { name: user.name, rolesIds: user.rolesIds } },
                    { upsert: true }
                );
            console.log(`Database: updated ${user.name}`);
        } catch (error) {
            console.log(error);
        }
    };

    resetUserDataBase = async (collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const result = await this.client.db("miodek").collection(collectionName).deleteMany({});
            console.log(`Database: removed ${result.deletedCount} documents`);
        } catch (error) {
            console.log(error);
        }
    };

    //remove users with no roles
    purgeUserDatabase = async (user: IUser, collectionName: string) => {
        try {
            collectionName = await this.validateCollection(collectionName);
            const result = await this.client
                .db("miodek")
                .collection(collectionName)
                .deleteMany({
                    rolesIds: { $e: 0 },
                    rolesNames: { $e: 0 },
                });
            console.log(`Database: ${result.deletedCount} users were purged`);
        } catch (error) {
            console.log(error);
        }
    };

    insertTwitchUser = async (user: ITwitchUser) => {
        try {
            const collectionName = await this.validateCollection("twitch-users");
            const result = await this.client.db("miodek").collection(collectionName).insertOne(user);
            if (result == null) {
                throw new Error(`Database: couldn't insert user`);
            } else return result;
        } catch (error) {
            throw error;
        }
    };
    getTwitchUsers = async () => {
        try {
            const collectionName = await this.validateCollection("twitch-users");
            const results = await this.client.db("miodek").collection(collectionName).find({});
            if (results == null) {
                throw new Error(`aha XD`);
            } else {
                const resultsData: unknown = await results.toArray();
                if ((resultsData as Array<ITwitchUser>).length == 0) throw "Database: no twitch users in database";
                else return resultsData as Array<ITwitchUser>;
            }
        } catch (error) {
            throw error;
        }
    };
}

export default new DatabaseC();
