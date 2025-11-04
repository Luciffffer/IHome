import User, { IUser, IUserDocument } from "@/models/User";
import dbConnect from "@/lib/db";
import { RegisterSchema } from "@/app/api/auth/register/route";

function toIUser(doc: IUserDocument): IUser {
    return {
        id: doc.id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password,
        profilePicture: doc.profilePicture,
        role: doc.role
    }
}

export class UserService {
    static async findUserByEmail(email: string) {
        await dbConnect();
        return User.findOne({ email });
    }

    static async findAllUsers(): Promise<IUser[]> {
        await dbConnect();
        const users = await User.find();
        return users.map(toIUser);
    }

    static async verifyCredentials(email: string, password: string): Promise<IUser | null> {
        await dbConnect()
        
        const user = await User.findOne<IUserDocument>({ email })
        if (!user) return null

        const isValid = await user.comparePassword(password)
        if (!isValid) return null

        return user as IUser;
    }

    static async register(data: RegisterSchema) {
        await dbConnect();

        const userObject = User.create<IUserDocument>({
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