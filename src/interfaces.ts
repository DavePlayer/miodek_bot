
interface user {
    name: string,
    clientId: string,
    roles: Array<string>
    user: Array<string>
}

interface role {
    id: string,
    name: string
}

interface json {
    users: Array<user> | []
    roles: Array<role> | []
}

export {
    user, role, json
}
