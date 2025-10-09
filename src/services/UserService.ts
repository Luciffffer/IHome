import User from "@/models/User";
import dbConnect from "@/lib/db";
import { RegisterSchema } from "@/app/api/auth/register/route";

export class UserService {
    static async findUserByEmail(email: string) {
        await dbConnect();
        return User.findOne({ email });
    }

    static async verifyCredentials(email: string, password: string) {
        await dbConnect()
        
        const user = await User.findOne({ email })
        if (!user) return null

        const isValid = await user.comparePassword(password)
        if (!isValid) return null

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        }
    }

    static async register(data: RegisterSchema) {
        await dbConnect();

        const userObject = User.create({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: data?.profilePicture,
            role: data?.role,
        })

        return userObject;
    }
}