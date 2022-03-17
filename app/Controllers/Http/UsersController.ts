import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import { rules, schema } from '@ioc:Adonis/Core/Validator';

export default class UsersController {
    public async register({ request, response }: HttpContextContract) {
        const validations = await schema.create({
            username: schema.string({ trim: true }, [
                rules.unique({ table: 'users', column: 'username' }),
                rules.maxLength(30),
            ]),
            email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
            password: schema.string({}, [rules.confirmed()]),
        });

        const data = await request.validate({ schema: validations });
        const user = await User.create(data);

        return response.json({
            'user':user,
            'status':200,
            'message':'Successful'
        });
    }
    public async login({ auth, request, response }: HttpContextContract) {
        const email = request.input("email");
    const password = request.input("password");
    const token = await auth.attempt(email, password, {
      expiresIn: "10 days",
    });
    return token.toJSON();
    }

    public async logout({ auth }: HttpContextContract) {
        await auth.logout();
        return { message: 'Successfully logged out' };
      }
}
