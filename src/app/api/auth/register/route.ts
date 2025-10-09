import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/UserService';
import { ZodError, z } from 'zod';

const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(100),
    firstName: z.string().trim().min(1).max(50),
    lastName: z.string().trim().min(1).max(50),
    profilePicture: z.url().optional(),
    role: z.enum(['user', 'admin']).optional()
})

export type RegisterSchema = z.infer<typeof registerSchema>;

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const validatedData = registerSchema.parse(data);

        const user = await UserService.register(validatedData);

        return NextResponse.json({ 
            email: user.user.email,
            id: user.user._id
         }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ errors: error.message }, { status: 400 });
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}