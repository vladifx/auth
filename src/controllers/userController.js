class UserController {
    getOneUser(request, reply) {
        try {
            const { id, username, created_at } = request.user;
            const user = { id, username, created_at };
            return reply.send(user);
        } catch (e) {
            console.error(e);
        }
    }
}

export default new UserController();