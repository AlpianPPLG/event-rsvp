import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { updateUser, getUserById } from "@/lib/database"

type UpdateProfileData = {
  name?: string;
  email?: string;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  let decoded;
  
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const data: UpdateProfileData = await request.json()

    // Input validation
    if (!data.name?.trim() || !data.email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" }, 
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format. Please provide a valid email address." }, 
        { status: 400 }
      )
    }

    // Name length validation
    if (data.name.length < 2 || data.name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters" },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(decoded.userId, {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim()
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Profile update error:", {
      error: errorMessage,
      stack: errorStack,
      userId: decoded?.userId,
      timestamp: new Date().toISOString()
    });

    // Type guard for database errors with code property
    const isDatabaseError = (err: unknown): err is { code: string; message: string } => {
      return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
    };
    
    // Type guard for validation errors
    const isValidationError = (err: unknown): err is { name: string; errors: unknown } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err;
    };

    // Handle specific error cases
    if (isDatabaseError(error) && (error.code === "ER_DUP_ENTRY" || error.message.includes("duplicate"))) {
      return NextResponse.json(
        { 
          success: false,
          error: "This email is already registered. Please use a different email address." 
        }, 
        { status: 409 }
      )
    }

    // Handle validation errors
    if (isValidationError(error) && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false,
          error: "Validation failed",
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update profile. Please try again later.",
        referenceId: `ERR-${Date.now()}`
      }, 
      { status: 500 }
    )
  }
}
