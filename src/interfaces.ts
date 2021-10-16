import { Moment } from "moment";

interface user {
    name: string;
    clientId: string;
    roles: Array<string>;
    user: Array<string>;
}

interface role {
    id: string;
    name: string;
}

interface json {
    users: Array<user> | [];
    roles: Array<role> | [];
}

interface clockExecutable {
    id: string;
    time: Moment;
    func: () => any;
}

interface doomed {
    id: string;
    roles: Array<string>;
}

export { user, role, json, clockExecutable, doomed };
