import User from "@/models/User";
import dbConnect from "@/lib/db";

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
}