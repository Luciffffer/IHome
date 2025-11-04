import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'user' | 'admin';
}

export interface IUserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'user' | 'admin';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUserDocument>({
    firstName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Not a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profilePicture: {
        type: String,
        required: false,
        trim: true,
        default: 'https://thispersondoesnotexist.com/'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next;

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
}

export default mongoose.models?.User || mongoose.model<IUserDocument>('User', UserSchema);