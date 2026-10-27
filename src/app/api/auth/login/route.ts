import { jsonWithCors, handleOptions } from '@/lib/cors';
import prisma from '@/lib/prisma';

export async function OPTIONS() {
  return handleOptions();
}

// POST /api/auth/login - Handles login for SIAS & SGP staff / faculty
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return jsonWithCors(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return jsonWithCors(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    if (user.passwordHash !== password.trim()) {
      return jsonWithCors(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.active) {
      return jsonWithCors(
        { success: false, error: 'User account has been deactivated. Contact Administrator.' },
        { status: 403 }
      );
    }

    // Check optional role restriction (e.g., if logging into SIAS which allows only ADMIN, REGISTRAR, CASHIER)
    if (role && user.role !== role) {
      // If user is Admin, allow override, otherwise enforce
      if (user.role !== 'ADMIN' && role !== 'ANY') {
        return jsonWithCors(
          {
            success: false,
            error: `Unauthorized: Your account has role ${user.role}, but role ${role} is required.`,
          },
          { status: 403 }
        );
      }
    }

    // Log login activity
    await prisma.auditLog.create({
      data: {
        userName: user.name,
        role: user.role,
        action: 'USER_LOGIN',
        entity: 'User',
        details: `User ${user.name} (${user.email}) logged in successfully as ${user.role}`,
      },
    });

    return jsonWithCors({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return jsonWithCors({ success: false, error: error.message }, { status: 500 });
  }
}
