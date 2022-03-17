import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Post from 'App/Models/Post';

export default class PostsController {
    public async index({ auth }: HttpContextContract) {
        await auth.use('api').authenticate();

        const userId = auth.user?.id || 0;

        return Post.query().where('user_id', userId);
    }
    public async store({ auth, request, response }: HttpContextContract) {
        await auth.use('api').authenticate();

        const validations = schema.create({
            title: schema.string({ trim: true }, [rules.minLength(5), rules.maxLength(200)]),
            content: schema.string({ trim: true }, [rules.minLength(10)]),
        });
        const userId = auth.user?.id || 0;

        const data = await request.validate({ schema: validations });
        const post = await Post.create({ ...data, userId });

        return response.created(post);
    }
    public async show({ auth, params, response }: HttpContextContract) {
        await auth.use('api').authenticate();

        const { id } = params;
        const userId = auth.user?.id || 0;

        const post = await Post.findOrFail(id);

        if (post.userId === userId) {
            return post;
        } else {
            return response.unauthorized({ message: 'User not authorized' });
        }
    }
    public async update({ auth, request, params, response }: HttpContextContract) {
        await auth.use('api').authenticate();

        const { id } = params;
        const userId = auth.user?.id || 0;

        const post = await Post.findOrFail(id);

        if (post.userId === userId) {
            const validations = schema.create({
                title: schema.string.optional({ trim: true }, [rules.minLength(5)]),
                content: schema.string.optional({ trim: true }, [rules.minLength(20)]),
            });

            const data = await request.validate({ schema: validations });
            post.merge(data);
            await post.save();

            return post;
        } else {
            return response.unauthorized({ message: 'User not authorized' });
        }
    }
    public async destroy({ auth, params, response }: HttpContextContract) {
        await auth.use('api').authenticate();

        const { id } = params;
        const userId = auth.user?.id || 0;

        const post = await Post.findOrFail(id);

        if (post.userId === userId) {
            post.delete();
            return response.noContent();
        } else {
            return response.unauthorized({ message: 'User not authorized' });
        }
    }
}
